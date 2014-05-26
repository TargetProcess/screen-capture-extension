define(['rest-api'], function(RestApi) {

    var storage = window.localStorage;

    return React.createClass({

        getDefaultProps: function() {

            return {
                autoLogin: false
            };
        },

        getInitialState: function() {

            return {
                accountName: storage.getItem('accountName') || '',
                host: '',
                isLogged: false,
                status: 'ready',
                user: null,
                isOnDemand: (storage.getItem('accountName') && storage.getItem('isOnDemand') === "false") ? false : true,
            };
        },

        doLogin: function(e) {

            e.preventDefault();
            var accountName = $(this.getDOMNode()).find('[name=login]').val();
            if (this.state.status === 'success') {
                this.logout();
            } else {
                this.login(accountName, this.state.isOnDemand);
            }
        },

        logout: function(e) {

            var loader = Ladda.create(this.getDOMNode().querySelector('[type=submit]'));
            loader.start();
            storage.setItem('accountName', '');
            Q
                .when(this.props.restApi.logout())
                .then(function() {
                    this.setState({
                        isLogged: false,
                        status: 'ready'
                    });
                }.bind(this))
                .done(function() {
                    loader.stop();
                });
        },

        login: function(accountName, isOnDemand) {

            storage.setItem('accountName', accountName);
            storage.setItem('isOnDemand', isOnDemand);

            this.setState({
                status: 'pending',
                statusText: ''
            });

            var loader = Ladda.create(this.getDOMNode().querySelector('[type=submit]'));
            loader.start();

            // for tests now, login to remote only if extension
            if (chrome.tabs) {
                if (isOnDemand) {
                    this.props.restApi.setOnDemandAccount(accountName);
                } else {
                    this.props.restApi.setOnSiteAccount(accountName);
                }
            }

            Q
                .when(this.props.restApi.auth())
                .then(this.props.restApi.getCurrentUser.bind(this.props.restApi))
                .then(function(user) {
                    if (this.isMounted()) { // when lay inside add form and umount later, to prevent race conditions
                        this.setState({
                            isLogged: true,
                            status: 'success',
                            user: user
                        });
                    }
                }.bind(this))
                .catch (function(err) {

                    this.setState({
                        status: 'failure',
                        statusText: err.message
                    });
                }.bind(this))
                .done(function() {
                    loader.stop();
                });
        },

        setAccountName: function(e) {

            this.setState({
                accountName: e.target.value
            });
        },

        toggleOnDemand: function() {

            var isOnDemand = !this.state.isOnDemand;
            var accountName = $(this.getDOMNode()).find('[name=login]').val();
            if (accountName) {
                if (isOnDemand) {
                    accountName = accountName.replace(/^https?:\/\//, '').replace(/.tpondemand.com\/?$/, '').replace(/\.[a-z]+$/, '');
                } else {
                    accountName = 'https://' + accountName + '.tpondemand.com';
                }
            }

            this.setState({
                isOnDemand: isOnDemand,
                accountName: accountName
            });
        },

        componentDidMount: function() {

            if (this.props.autoLogin && this.state.accountName) {
                this.login(this.state.accountName, this.state.isOnDemand);
            }

            this.props.restApi.onAuth.add(function(){
                if (!this.state.isLogged) {
                    Q
                        .when(this.props.restApi.getCurrentUser())
                        .then(function(user) {
                            if (this.isMounted()) { // when lay inside add form and umount later, to prevent race conditions
                                this.setState({
                                    isLogged: true,
                                    status: 'success',
                                    user: user
                                });
                            }
                        }.bind(this));
                }
            }.bind(this));
        },

        render: function() {

            var loginForm;
            var button;
            var alert;
            var help;

            if (this.state.status === 'success' && !this.props.hideResult) {
                loginForm = (
                    <div className="media">
                        <span className="pull-left">
                            <img src={this.state.user.avatarSrc} className="img-circle media-object" />
                        </span>
                        <div className="media-body">
                            <h5 className="media-heading">{this.state.user.name}</h5>
                            <div className="domain-control"><a href={this.props.restApi.host}>{this.props.restApi.hostName}</a></div>
                        </div>
                    </div>
                );
            } else {
                if (this.state.isOnDemand) {
                    loginForm = (
                        <div className="domain-control">
                            <input className="form-control" name="login" type="text" placeholder="account" required pattern="[A-Za-z-0-9]+" title="your-host1313" value={this.state.accountName} onChange={this.setAccountName} />
                            <span className="domain-control__ondemand" onClick={this.toggleOnDemand}> .tpondemand.com</span>
                        </div>
                    );
                } else {
                    loginForm = (
                        <div className="domain-control">
                            <input className="form-control" name="login" type="url" placeholder="URL" required pattern="*" title="https://yourhost.com" value={this.state.accountName} onChange={this.setAccountName} />
                            <span className="domain-control__ondemand" onClick={this.toggleOnDemand}> / </span>
                        </div>
                    );
                }

                help = (
                    <p className="help-block clearfix"><a className="pull-right" href="http://www.targetprocess.com/" target="_blank">Don't have an account yet?</a></p>
                );
            }

            if (!this.state.isLogged) {
                button = <button className="btn btn-success btn-lg btn-block ladda-button" data-style="slide-left" type="submit"><span className="ladda-label">Login</span></button>;
            } else {
                button = <button className="btn btn-default btn-lg btn-block ladda-button" data-style="slide-left" type="submit"><span className="ladda-label">Logout</span></button>;
            }

            if (this.state.status === 'failure') {
                alert = <div className="alert alert-danger">{this.state.statusText}</div>;
            }

            return (
                <form className="form-settings" action="#" onSubmit={this.doLogin}>
                    {alert}

                    <div className="form-group">
                        {help}
                        {loginForm}
                    </div>
                    {button}
                </form>
            );
        }
    });
});
