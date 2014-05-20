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
            var obj = this.props.paintManager.canvas.getActiveObject() || this.props.paintManager.canvas.getActiveGroup();

            this.props.paintManager.setColor(value);
            this.setState({
                color: value
            });
            storage.setItem('color', value);

            if (obj) {
                var objs = [obj];

                if (obj.type === 'group') {
                    objs = obj.getObjects();
                }

                objs.forEach(function(obj) {

                    if (obj.type === 'i-text') {
                        obj.set('fill', value);
                    } else {
                        obj.set('stroke', value);
                    }
                });

                this.props.paintManager.canvas.renderAll();
            }
        },

        componentDidMount: function() {
            this.props.paintManager.setColor(this.state.color);
        },

        render: function() {

            return (
                <li className="tools__item tools__item-color">
                    <input title="color" className="tools__trigger" type="color" onChange={this.selectColor} defaultValue={this.state.color} />
                </li>
            );
        }
    });
});
