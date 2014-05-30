define(['./card-entity'], function(Card) {
    'use strict';

    return  React.createClass({

        getInitialState: function() {
            return {
                validate: false,
                entity: null,
                items: ['userstory', 'bug', 'request']
            };
        },

        componentDidMount: function() {

            var $inp = $(this.refs.autocomplete.getDOMNode());

            var ajaxData = JSON.stringify({
                base64: true,
                take: 6,
                definition: {
                    cells: {
                        items: this.state.items.map(function(v) {
                            return {
                                id: v
                            };
                        }),
                        ordering: {
                            direction: 'Desc',
                            name: 'Creation Date'
                        }
                    },
                    user: {
                        cardFilter: '%QUERY'
                    }

                }
            });

            var source = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                limit: 6, // more make scroll :(

                remote: {
                    url: this.props.restApi.host + '/slice/v1/matrix/list?%QUERY',
                    replace: function(url, query) {
                        this.ajax.data = ajaxData.replace('%QUERY', query);
                        return url.replace('%QUERY', query);
                    },
                    filter: function(data) {
                        console.log(data.items[0].dynamic.items.length);
                        return data.items[0].dynamic.items.map(function(v) {
                            return {
                                value: v.data.id + ' ' + v.data.name,
                                data: v.data
                            };
                        });
                    },
                    ajax: {
                        type: 'POST',
                        contentType: 'application/json; charset=UTF-8',
                        dataType: 'json',
                        data: ajaxData
                    }
                }
            });

            source.initialize();

            $inp.typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            }, {
                displayKey: 'value',
                source: source.ttAdapter(),
                templates: {
                    suggestion: function(item) {
                        return '<div class="' + item.data.type.toLowerCase() + '"><span class="suggestion__id">' + item.data.id + '</span></div><div>' + item.data.name + '</div>';
                    }
                }
            });

            $inp.on('typeahead:selected', function(e, item) {

                this.setState({
                    entity: {
                        id: item.data.id
                    },
                    status: null
                });
            }.bind(this));
        },

        onSubmit: function(e) {

            e.preventDefault();
            if (!this.state.entity) return;

            var entity = this.state.entity;

            var loader = Ladda.create(this.getDOMNode().querySelector('[type=submit]'));
            loader.start();

            return Q.when(this.props.paintManager.exportDataURL())
            .then(function(imageData) {

                return this.props.restApi
                    .postAttach(entity.id, imageData)
                    .progress(function(progress) {
                        loader.setProgress(progress);
                    });

            }.bind(this))
            .then(function(attach){

                entity.ModifyDate = new Date();
                this.setState({
                    status: 'append',
                    entity: entity,
                    validate: false
                });
            }.bind(this))
            .catch(function(err) {

                this.setState({
                    statusText: err.message,
                    status: 'failure'
                });
            }.bind(this))
            .done(function() {
                loader.stop();
            });
        },

        onChange: function(e) {

            if (!e.target.value) {
                this.setState({
                    entity: null,
                    status: null
                });
            }
        },

        render: function() {

            var alert;
            var entity;

            if (this.state.status === 'success' || this.state.status === 'append') {
                alert = <div className="alert alert-success">{this.state.status === 'success' ? 'Entity is added' : 'Attach is added'}</div>;
            }

            if (this.state.entity) {
                entity = (
                    <div className="form__card">
                        <Card entity={this.state.entity} restApi={this.props.restApi} />
                    </div>
                );
            }

            return (
                <form action="#" onSubmit={this.onSubmit} className={this.state.validate ? 'validate' : null}>
                    <fieldset className="fieldset-main">
                        {alert}
                        <div className="form-group">
                            <input ref="autocomplete" className="form-control typeahead" onChange={this.onChange} type="search" placeholder="Enter ID or Name" />
                        </div>
                        {entity}
                    </fieldset>
                    <fieldset>
                        <button className="btn btn-success btn-lg btn-block ladda-button" data-style="expand-left" type="submit" disabled={!Boolean(this.state.entity)}>
                            <span className="ladda-label">{this.state.entity ? "Attach to selected entity" : "Attach to existing entity"}</span>
                        </button>
                    </fieldset>
                </form>
            );
        }
    });
});
