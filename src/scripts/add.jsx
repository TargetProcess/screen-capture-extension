define(['./add-form', './popover'], function(Form, Popover) {

    return React.createClass({

        getInitialState: function() {
            return {
                bubbleVisible: false
            };
        },

        toggleBubble: function() {
            this.refs.popover.toggle(this.getDOMNode());
            // this.refs.form.loadFields();
        },

        render: function() {

            return (
                <li className="tools__item tools__item-add">
                    <button className="tools__trigger" title="add" onClick={this.toggleBubble}>
                        <i className="icon icon-add"></i>
                    </button>
                    <Popover ref="popover">
                        <Form ref="form" restApi={this.props.restApi} paintManager={this.props.paintManager} />
                    </Popover>
                </li>
            );
        }
    });
});
