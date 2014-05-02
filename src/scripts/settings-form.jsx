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
            if (this.state.status === 'success') {
                this.logout();
            } else {
                this.login(accountName);
            }

        },

        logout: function(e) {
            Q.when(this.props.restApi.logout()).then(function() {
                this.setState({
                    status: 'ready'
                });
            }.bind(this));
        },

        login: function(accountName) {

            storage.setItem('accountName', accountName);
            var host = 'https://' + accountName + '.tpondemand.com';

            this.setState({
                accountName: accountName,
                host: host,
                status: 'pending'
            });

            // this.props.restApi.setHost(host);
            this.props.restApi.auth().then(function(data, status, res){

                if (this.props.onLogin) {
                    this.props.onLogin();
                } else {
                    this.setState({
                        status: 'success'
                    });
                }

            }.bind(this))
            .catch(function(e){
                this.setState({
                    status: 'failure',
                    alert: 'Can\'t log in'
                });
            }.bind(this))
            .done();
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
                        <input className="form-control" name="login" type="text" placeholder="account" required defaultValue={this.state.accountName} />
                        <span>.tpondemand.com</span>
                    </div>
                );
            }


            return (
                <form className="form-settings" action="#" onSubmit={this.doLogin} style={this.state.status === 'pending' ? {opacity: 0.5} : {}}>
                        {this.state.alert ? <div className="alert alert-danger">{this.state.alert}</div> : ''}
                        <div className="form-group">
                            <label>Targetprocess Account</label>
                            {loginForm}
                        </div>
                        {this.state.status !== 'success' ? <button className="btn btn-success btn-lg btn-block" type="submit">Login</button> : <button className="btn btn-primary btn-lg btn-block" type="submit">Logout</button>}
                </form>
            );
        }
    });
});
