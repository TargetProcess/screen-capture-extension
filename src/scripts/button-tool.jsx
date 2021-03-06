/**
 * @jsx React.DOM
 */
define(function(){

    'use strict';

    return React.createClass({

        componentDidMount: function() {
            this.props.paintManager.registerTool(this.props.name, this.props.tool);
        },

        select: function() {
            this.props.paintManager.selectTool(this.props.name);
        },

        render: function() {

            return (
                <li className={"tools__item tools__item-" + this.props.name + " " + this.props.className}>
                    <button title={this.props.title || this.props.name} className="tools__trigger" onClick={this.select}>
                        <i className={"icon icon-" + this.props.name}></i>
                    </button>
                </li>
            );
        }
    });
});
