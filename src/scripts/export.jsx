define(function(){

    return React.createClass({

        getDefaultProps: function(){
            return {
                name: 'export',
                title: 'export',
                className: ''
            };
        },

        select: function() {
            this.refs.link.getDOMNode().href = this.props.paintManager.canvas.toDataURL();
        },

        render: function() {

            return (
                <li className={"tools__item tools__item-" + this.props.name + " " + this.props.className}>
                    <a download="targetprocess-screen-capture.png" ref='link' title={this.props.title || this.props.name} className="tools__trigger" onClick={this.select}>
                        <i className={"icon icon-" + this.props.name}></i>
                    </a>
                </li>
            );
        }
    });
});
