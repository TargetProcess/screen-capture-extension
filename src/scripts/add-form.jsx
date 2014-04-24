/*globals React */
define([], function(Form){
    'use strict';
    return React.createClass({

        getInitialState: function() {
            return {
                status: 'ready',
                message: ''
            };
        },

        doSend: function(e) {
            e.preventDefault();
            this.createEntity();
        },

        createEntity: function() {

            this.setState({
                status: 'pending',
                message: 'Entitis in progress!!!'
            });


            this.props.restApi.post('Bugs', {
                Name: 'bububu',
                Project: {
                    Id: 13
                }
            })
            .then(function(entity) {

                this.setState({
                    message: 'Entitis is added'
                });

                return this.props.restApi.postAttach(entity, this.props.paintManager.canvas.toDataURL());
            }.bind(this))
            .then(function() {
                this.setState({
                    status: 'success',
                    message: 'Entitis is done!!!'
                });
            }.bind(this))
            .catch(function() {
                this.setState({
                    status: 'failure',
                    message: 'Entitis is failed'
                });
            }.bind(this));
        },


        componentDidMount: function() {

        },

        render: function() {
            return (
                <form className="form-add" action="#" onSubmit={this.doSend} style={this.state.status === 'pending' ? {opacity: 0.5} : {}}>
                    <h3>{this.state.message}</h3>
                    <div className="form-group">
                        <input className="form-control" type="text" placeholder="Name" />
                    </div>
                    <div className="form-group">

                    </div>
                    <button className="btn btn-success btn-lg btn-block" type="submit">Add Issue</button>
                </form>
            );
        }
    });
});
