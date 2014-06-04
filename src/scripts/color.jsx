define(['./storage'], function(storage) {

    return React.createClass({

        getInitialState: function() {
            return {
                color: '#' + Math.round(Math.random() * 255*255*255).toString(16)
            };
        },

        selectColor: function(e) {

            var value = e.currentTarget.value;
            var obj = this.props.paintManager.canvas.getActiveObject() || this.props.paintManager.canvas.getActiveGroup();

            this.props.paintManager.setColor(value);
            this.setState({
                color: value
            });

            storage.set('color', value);

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

            storage.get('color').then(function(val) {
                if (val) {
                    this.setState({
                        color: val
                    });
                }
                this.props.paintManager.setColor(this.state.color);
            }.bind(this));
        },

        render: function() {

            return (
                <li className="tools__item tools__item-color">
                    <input title="color" className="tools__trigger" type="color" onChange={this.selectColor} value={this.state.color} />
                </li>
            );
        }
    });
});
