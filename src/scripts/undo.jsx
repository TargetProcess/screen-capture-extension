/**
 * @jsx React.DOM
 */
define(function() {

    'use strict';

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

            this.props.paintManager.onUndo.add(function() {
                if (this.props.paintManager.states.length === 0) {
                    this.setState({
                        enabled: false
                    });
                }
            }.bind(this));

            this.props.paintManager.onStateAdded.add(function() {
                this.setState({
                    enabled: true
                });
            }.bind(this));
        },

        render: function() {

            return (
                <li className={"tools__item tools__item-undo"}>
                    <button title="undo" className="tools__trigger" onClick={this.select} disabled={!this.state.enabled} >
                        <i className="icon icon-undo"></i>
                    </button>
                </li>
            );
        }
    });
});
