define(['rest-api'], function(RestApi) {

    var storage = window.localStorage;

    return React.createClass({

        getInitialState: function() {
            return {
                accountName: storage.getItem('accountName') || '',
                host: '',
                isLogged: false,
                status: 'ready'
            };
        },

        doLogin: function(e) {

            e.preventDefault();
            var accountName = $(this.getDOMNode()).find('[name=login]').val();

            this.login(accountName);
        },

        login: function(accountName) {

            if (!accountName) {
                return;
            }

            storage.setItem('accountName', accountName);
            var host = 'https://' + accountName + '.tpondemand.com';

            this.setState({
                accountName: accountName,
                host: host,
                status: 'pending'
            });

            this.props.restApi.setHost(host);
            this.props.restApi.auth().then(function(data, status, res){
                this.setState({
                    status: 'success'
                });
            }.bind(this))
            .catch(function(){
                this.setState({
                    status: 'failure'
                });
            }.bind(this));
        },

        componentDidMount: function() {
            // this.login();
        },

        render: function() {

            var loginForm;

            if (this.state.status === 'success') {
                loginForm = (
                    <div className="domain-control">
                        <span>{this.state.accountName}</span>
                        <span>.tpondemand.com</span>
                    </div>
                );
            } else {
                loginForm = (
                    <div className="domain-control">
                        <input className="form-control" name="login" type="text" placeholder="account"  defaultValue={this.state.accountName} />
                        <span>.tpondemand.com</span>
                    </div>
                );
            }


            return (
                <form className="form-settings" action="#" onSubmit={this.doLogin} style={this.state.status === 'pending' ? {opacity: 0.5} : {}}>
                    <div className="popover-content">
                        <div className="checkbox">
                            <label><input type="checkbox" />Pin panel</label>
                        </div>
                    </div>
                    <div className="popover-content">
                        <div className="form-group">
                            <label>Targetprocess Account</label>
                            {loginForm}
                        </div>
                        {this.state.status !== 'success' ? <button className="btn btn-success btn-lg btn-block" type="submit">Login</button> : ''}
                    </div>
                </form>
            );
        }
    });
});
