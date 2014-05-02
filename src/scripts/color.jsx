define([], function() {

    var storage = window.localStorage;

    return React.createClass({

        getInitialState: function() {
            return {
                color: storage.getItem('color') || ('#' + Math.round(Math.random() * 255*255*255).toString(16))
            };
        },

        selectColor: function(e) {

            var value = e.currentTarget.value;

            this.props.paintManager.setColor(value);
            this.setState({
                color: value
            });
            storage.setItem('color', value);
        },

        componentDidMount: function() {
            this.props.paintManager.setColor(this.state.color);
        },

        render: function() {

            return (
                <li className="tools__item tools__item-color">
                    <input className="tools__trigger" type="color" onChange={this.selectColor} defaultValue={this.state.color} />
                </li>
            );
        }
    });
});
