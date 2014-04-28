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
            // console.log(trigger, visible);
            this.setState({
                visible: visible,
                trigger: trigger,
                style: {
                    display: visible ? 'block' : 'none',
                    visibility: 'hidden'
                }
            });

            this.state.visible = visible;

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

            var triggerRect = el.getBoundingClientRect();
            var thisRect = this.getDOMNode().getBoundingClientRect();

            var top = triggerRect.bottom - thisRect.height / 2 - triggerRect.height / 2;
            var position = 'center';
            if (top < 0) {
                top = triggerRect.top;
                position = 'top';
            }

            if (top + thisRect.height > $(window).height()) {
                top = triggerRect.top + triggerRect.height - thisRect.height;
                position = 'bottom';
            }

            if (top === 0) {
                top = 3;
            } else if (top + thisRect.height === $(window).height()) {
                top = top - 3;
            }

            var arrowTop;
            switch (position) {
                case 'top':
                    arrowTop = triggerRect.height / 2;
                    break;

                case 'bottom':
                    arrowTop = thisRect.height - triggerRect.height / 2;
                    break;

                default:
                    arrowTop = thisRect.height / 2;
                    break;
            }


            this.setState({
                visible: this.state.visible,
                trigger: this.state.trigger,
                arrowStyle: {
                    top: arrowTop
                },
                style: {
                    display: this.state.visible ? 'block' : 'none',
                    top: top
                }
            });
        },

        componentDidMount: function() {
            // return;
            $(document).on('click', function(e){
                var trigger = this.state.trigger;
                // debugger;
                // console.log(trigger, e.target);
                if ((e.target !== this.getDOMNode() && !$(this.getDOMNode()).find(e.target).length) ||
                    (trigger && e.target === trigger && !$(trigger).find(e.target).length)) {
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
