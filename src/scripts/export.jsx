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
            Q
                .when(this.props.paintManager.exportDataURL())
                .then(function(imageData) {

                    var $link = $(this.refs.link.getDOMNode());
                    $link.attr('href', imageData);
                    $link.attr('download', 'targetprocess-screen-capture.png');
                    $link[0].dispatchEvent(new MouseEvent('click'));
                    $link.removeAttr('href');
                    $link.removeAttr('download');
                }.bind(this));
        },

        render: function() {

            return (
                <li className={"tools__item tools__item-" + this.props.name + " " + this.props.className}>
                    <a ref='link' title={this.props.title || this.props.name} className="tools__trigger" onClick={this.select}>
                        <i className={"icon icon-" + this.props.name}></i>
                    </a>
                </li>
            );
        }
    });
});
