define(['Class'], function(Class){

    return React.createClass({

        getInitialState: function() {
            return {
                enabled: false
            };
        },

        select: function() {
            this.props.paintManager.undo();
        },

        componentDidMount: function() {

            this.props.paintManager.onUndo = function(){
                if (this.props.paintManager.states.length === 0) {
                    this.setState({
                        enabled: false
                    });
                }
            }.bind(this);

            this.props.paintManager.onStateAdded = function(){
                this.setState({
                    enabled: true
                });
            }.bind(this);
        },

        render: function(){

            var disabled = this.state.enabled ? null : 'disabled';

            return (
                <li className={"tools__item tools__item-undo"}>
                    <button className="tools__trigger" onClick={this.select} disabled={!this.state.enabled} >
                        <i className="icon icon-undo"></i>
                    </button>
                </li>
            );
        }
    });
});
