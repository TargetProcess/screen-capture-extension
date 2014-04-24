define(['rest-api'], function(RestApi) {

    return React.createClass({

        getInitialState: function() {
            return {
                accountName: '',
                isLogged: false,
                status: 'ready',
                restApi: new RestApi()
            };
        },

        doLogin: function(e) {
            e.preventDefault();
            this.login();
        },

        login: function() {
            this.setState({
                status: 'pending'
            });

            this.state.restApi.auth().then(function(data, status, res){
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
            this.login();
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
                        <input className="form-control" name="login" type="text" placeholder="account"  value={this.state.accountName} />
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
