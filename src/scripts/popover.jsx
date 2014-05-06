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

            var visible = !this.state.visible;

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

        alignTo: function(trigger) {

            var el = trigger;

            if (!trigger) return;

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
            $(document).on('click', function(e){
                var trigger = this.state.trigger;
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

            var observer = new MutationObserver(function(mutations) {
                this.alignTo(this.state.trigger);
            }.bind(this));

            var config = {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            };
            observer.observe(this.getDOMNode(), config);
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
