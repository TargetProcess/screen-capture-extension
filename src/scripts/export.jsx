define(function(){


    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

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

                    var blob = b64toBlob(imageData.replace('data:image/png;base64,', ''), 'image/png');
                    var url = URL.createObjectURL(blob);

                    $link.attr('href', url);
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
