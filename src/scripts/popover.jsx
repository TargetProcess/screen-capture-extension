define([], function(){

    return React.createClass({

        getInitialState: function() {
            return {
                visible: false,
                trigger: false,
                style: {}
            };
        },

        toggle: function(trigger, flag) {
            // debugger;
            var visible = !this.state.visible;
            this.setState({
                visible: visible,
                trigger: trigger,
                style: {
                    display: visible ? 'block' : 'none',
                    visibility: 'hidden'
                }
            });

            setTimeout(function(){
                this.alignTo(trigger);
            }.bind(this), 100);
        },

        hide: function() {
            this.setState({
                visible: false,
                style: {
                    display: 'none'
                }
            });
        },

        alignTo: function(el) {

            var top = el.getBoundingClientRect().bottom - this.getDOMNode().getBoundingClientRect().height;

            this.setState({
                arrowStyle: {
                    top: top - el.getBoundingClientRect().top + 25
                },
                style: {
                    display: this.state.visible ? 'block' : 'none',
                    top: top > 0 ? top : el.getBoundingClientRect().top
                }
            });
        },

        componentDidMount: function() {
            $(document).on('click', function(e){
                var trigger = this.state.trigger;
                console.log(trigger, e.target);
                if (e.target !== this.getDOMNode() && !$(this.getDOMNode()).find(e.target).length && trigger && !$(e.target).is(trigger)) {
                    this.setState({
                        visible: false,
                        style: {
                            display: 'none'
                        }
                    });
                }
            }.bind(this));
        },

        render: function() {

            return (
                <div className="popover right" style={this.state.style}>
                    <div className="arrow" style={this.state.arrowStyle}></div>
                    <div className="popover-content">
                        {this.props.children}
                    </div>
                </div>
            );
        }
    });
});
