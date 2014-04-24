define(['./popover'], function(Popover){

    return React.createClass({

        getInitialState: function() {
            return {
                color: 'orange',
                colors: ['orange', 'black', 'blue', 'red', 'green', 'white']
            };
        },

        togglePopover: function() {
            this.refs.popover.toggle(this.getDOMNode());
        },

        selectColor: function(e) {
            var value = $(e.currentTarget).prev().css('backgroundColor');

            var tool = this.props.paintManager.selectedTool;
            this.props.paintManager.options.color = value;
            this.setState({
                color: e.currentTarget.value
            });

            this.props.paintManager.selectTool(tool);
            this.refs.popover.hide();
        },

        componentDidMount: function() {
            // this.props.paintManager.options.color = $(e.currentTarget).prev().css('backgroundColor');
        },

        render: function(){

            return (
                <li className="tools__item tools__item-color">
                    <button className="tools__trigger" onClick={this.togglePopover}>
                        <i className={"icon icon-color icon-color_" + this.state.color}></i>
                    </button>

                    <Popover ref="popover">
                        <form className="form-color">
                            {this.state.colors.map(function(v){
                                var className = "icon icon-color icon-color_" + v;
                                return (
                                    <label key={v}>
                                        <i className={className}></i>
                                        <input type="radio" name="color" value={v} onChange={this.selectColor} />
                                    </label>
                                );
                            }.bind(this))}
                        </form>
                    </Popover>
                </li>
            );
        }
    });
});
