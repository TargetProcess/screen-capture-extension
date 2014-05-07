define(['rest-api'], function(RestApi) {

    var storage = window.localStorage;

    return React.createClass({

        getInitialState: function() {

            return {
                accountName: storage.getItem('accountName') || '',
                host: '',
                isLogged: false,
                status: 'ready',
                user: null
            };
        },

        doLogin: function(e) {

            e.preventDefault();
            var accountName = $(this.getDOMNode()).find('[name=login]').val();
            if (this.state.status === 'success') {
                this.logout();
            } else {
                this.login(accountName);
            }

        },

        logout: function(e) {
            var loader = Ladda.create(this.getDOMNode().querySelector('[type=submit]'));
            loader.start();
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

        login: function(accountName) {

            storage.setItem('accountName', accountName);

            this.setState({
                status: 'pending',
                statusText: ''
            });

            var loader = Ladda.create(this.getDOMNode().querySelector('[type=submit]'));
            loader.start();

            this.props.restApi.setOnDemandAccount(accountName);

            Q
                .when(this.props.restApi.auth())
                .then(this.props.restApi.getCurrentUser.bind(this.props.restApi))
                .then(function(user) {

                    this.setState({
                        isLogged: true,
                        status: 'success',
                        user: user
                    });
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

        componentDidMount: function() {

            // setTimeout(function(){
            if (this.state.accountName) {
                this.login(this.state.accountName);
            }
            // }.bind(this), 100);
        },

        render: function() {

            var loginForm;
            var button;
            var alert;

            if (this.state.status === 'success') {
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
                loginForm = (
                    <div className="domain-control">
                        <input className="form-control" name="login" type="text" placeholder="account" required defaultValue={this.state.accountName} />
                        <span>.tpondemand.com</span >
                    </div>
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
                    <div className ="form-group">
                        {loginForm}
                    </div>
                    {button}
                </form >
            );
        }
    });
});
