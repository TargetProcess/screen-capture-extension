/**
 * @jsx React.DOM
 */
define(['./settings-form', './popover'], function(Form, Popover){

    'use strict';

    return React.createClass({

        getInitialState: function(){
            return {
                bubbleVisible: false,

            };
        },

        toggleBubble: function() {
            this.refs.popover.toggle(this.getDOMNode());
        },

        render: function() {
            var style;
            if (this.state.bubbleVisible) {
                style = {display: 'block'};
            }
            return (
                <li className="tools__item tools__item-settings">
                    <button title="settings" className="tools__trigger" onClick={this.toggleBubble}>
                        <i className="icon icon-settings"></i>
                    </button>
                    <Popover ref="popover">
                        <Form autoLogin={true} restApi={this.props.restApi} />
                    </Popover>
                </li>
            );
        }
    });
});
