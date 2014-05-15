define(['./card-entity'], function(Card) {
    'use strict';

    var FieldInput = React.createClass({

        serialize: function() {

            if (!this.props.field.isVisible) {
                return null;
            }

            return {
                name: this.props.field.name,
                type: this.props.field.type,
                value: $(this.refs.input.getDOMNode()).val()
            };
        },

        render: function() {

            var data = this.props.field;

            var classSet = React.addons.classSet({
                "form-group": true,
                "hidden": !data.isVisible
            });

            return (
                <div className={classSet}>
                    {data.isCustomField ? <label htmlFor={data.name}>{data.caption}</label> : '' }
                    <input ref="input" name={data.name} id={data.name} className="form-control" type={data.inputType} defaultValue={data.config.defaultValue}
                        disabled={!data.isVisible}
                        placeholder={data.isCustomField ? null : data.caption}
                        required={data.required}
                        aria-required={data.required}
                    />
                </div>
            );
        }
    });

    var FieldSelect = React.createClass({

        serialize: function() {

            if (!this.props.field.isVisible) {
                return null;
            }


            var val = $(this.refs.input.getDOMNode()).val();
            return {
                name: this.props.field.name,
                type: this.props.field.type,
                value: Array.isArray(val) ? val.join(',') : val
            };
        },

        render: function() {
            var data = this.props.field;
            var options = data.options.values.map(function(v){
                return (<option key={v.id} value={v.id} data-process-id={v.processId}>{v.title}</option>);
            });

            if (!data.required) {
                options.unshift(<option></option>);
            }

            var classSet = React.addons.classSet({
                "form-group": true,
                "hidden": !data.isVisible
            });

            return (
                <div className={classSet} key={data.name}>
                    {data.isCustomField ? <label>{data.caption}</label> : ''}
                    <select ref='input' name={data.name} className="form-control" defaultValue={data.config.defaultValue}
                        multiple={data.multiple}
                        disabled={!data.isVisible}
                        onChange={this.props.onChange}
                        required={data.required}
                        aria-required={data.required} >
                        {options}
                    </select>
                </div>
            );
        }
    });

    var FieldUrl = React.createClass({


        serialize: function() {

            if (!this.props.field.isVisible) {
                return null;
            }

            return {
                name: this.props.field.name,
                type: this.props.field.type,
                value: {
                    url: $(this.refs.url.getDOMNode()).val(),
                    label: $(this.refs.label.getDOMNode()).val()
                }
            };
        },

        render: function() {
            var data = this.props.field;

            return (
                <div className={data.isVisible ? null : 'hidden'}>
                    <div className="form-group" key={data.name + '_u'}>
                        <label>{data.caption}</label>
                        <input ref="url" name={data.name + '__url'} className="form-control" type="url" placeholder='URL'
                        disabled={!data.isVisible}
                        required={data.required}
                        aria-required={data.required} />

                    </div>
                    <div className="form-group" key={data.name + '_d'}>
                        <input ref="label" name={data.name + '__label'} className="form-control" type="text" placeholder='URL Description'
                        disabled={!data.isVisible}
                        required={data.required}
                        aria-required={data.required} />
                    </div>
                </div>

            );
        }
    });

    var FieldCheckbox = React.createClass({

        serialize: function() {

            if (!this.props.field.isVisible) {
                return null;
            }


            if ($(this.refs.input.getDOMNode()).prop('checked')) {
                return {
                    name: this.props.field.name,
                    type: this.props.field.type,
                    value: $(this.refs.input.getDOMNode()).val()
                };
            } else {
                return null;
            }
        },

        render: function() {
            var data = this.props.field;

            var classSet = React.addons.classSet({
                "checkbox": true,
                "hidden": !data.isVisible
            });

            return (
                <div className={classSet} key={data.name}>
                    <label>
                        <input ref="input" name={data.name} type="checkbox" value="true"
                            disabled={!data.isVisible} />
                        {data.caption}
                    </label>
                </div>
            );
        }
    });

    return React.createClass({

        getInitialState: function() {
            return {
                fields: [],
                processId: null,
                entity: null,
                validate: false
            };
        },

        componentDidMount: function() {

            this.getDOMNode().addEventListener('invalid', function first(){
                this.setState({
                    validate: true
                });
                this.getDOMNode().removeEventListener('invalid', first);
            }.bind(this), true);


            this.props.restApi
                .getForm(this.props.restId)
                .then(function(fields) {
                    var processId = this.getCurrentProcessId(fields);
                    fields = this.processFields(fields);
                    fields = this.filterFieldsByProcessId(fields, processId);

                    this.setState({
                        processId: Number(processId),
                        fields: fields
                    });
                }.bind(this))
                .done();
        },

        getCurrentProcessId: function(fields) {

            var project = _.findWhere(fields, {
                id: 'project'
            });
            var processId = _.findWhere(project.options.values, {
                id: project.options.selectedValue
            }).processId;

            return Number(processId);
        },

        processFields: function(fields) {

            fields = fields.map(function(field) {

                field.isCustomField = (field.type === 'CustomField');
                field.type = (field.fieldType || field.type);
                field.config = field.config || {
                    defaultValue: null
                };

                if (field.type === 'DropDown' || field.type === 'MultipleSelectionList') {
                    field.options = {
                        values: field.options.value.split(/\r?\n/).map(function(opt) {
                            return {
                                id: opt,
                                title: opt
                            };
                        })
                    };
                }

                if (field.type === 'DDL') {
                    field.config = {
                        defaultValue: field.options.selectedValue
                    };
                }

                if (field.type === 'MultipleSelectionList') {
                    field.multiple = true;
                    field.config.defaultValue = field.config.defaultValue.split(/\s*,\s*/);
                }

                if (field.isCustomField) {
                    field.name = 'CustomFields__' + field.caption;
                } else {
                    field.name = field.id;
                }

                if (['Text', 'Number', 'Date', 'TemplatedURL'].indexOf(field.type)) {
                    field.inputType = field.type === 'TemplatedURL' ? 'text' : field.type.toLowerCase();
                }

                return field;
            });
            return fields;
        },

        onSelectProject: function(e) {

            var processId = Number($(e.target).find('option:selected')[0].dataset.processId);
            if (processId) {

                this.setState({
                    fields: this.filterFieldsByProcessId(this.state.fields, processId),
                    processId: processId
                });
            }
        },

        filterFieldsByProcessId: function(fields, processId) {

            if (processId) {
                fields = fields.map(function(field) {
                    field.isVisible = !field.processId || field.processId === processId;
                    return field;
                });
            }

            return fields;
        },

        onSubmit: function(e) {

            e.preventDefault();
            var values = this.getValues();
            var loader = Ladda.create(this.getDOMNode().querySelector('[type=submit]'));
            loader.start();

            this.props
                .restApi.submitForm(this.props.restId, values)
                .then(function(entity) {
                    return Q.all([
                        entity,
                        this.props.restApi.postAttach(entity.id, this.props.paintManager.canvas.toDataURL())
                            .progress(function(progress) {
                                loader.setProgress(progress);
                            })
                    ]);
                }.bind(this))
                .spread(function(entity, attach){
                    this.getDOMNode().reset();
                    this.setState({
                        status: 'success',
                        entity: entity,
                        attach: attach,
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

        getValues: function() {

            var values = _.compact(_.values(this.refs).map(function(ref) {
                return ref.serialize();
            }));

            values = values.reduce(function(res, field){
                // debugger;
                var name = field.name.split('__');
                var val;
                if (name.length === 2) {
                    val = {
                        name: name[1],
                        value: field.value
                    };
                    var parent = _.findWhere(res, {
                        id: name[0]
                    });

                    if (!parent) {
                        parent = {
                            id: name[0],
                            value: []
                        };
                        res = res.concat(parent);
                    }
                    parent.value.push(val);
                    return res;
                } else {
                    val = {
                        id: name[0],
                        value: field.value
                    };
                    return res.concat(val);
                }
            }, []);

            return values.map(function(v){
                if (Array.isArray(v.value)) {
                    v.value = JSON.stringify(v.value);
                }

                return v;
            });

        },

        render: function() {

            var groupFieldsData = _.groupBy(this.state.fields, function(field) {
                return field.isCustomField ? 'custom' : 'main';
            });

            var groupFields = _.object(_.map(groupFieldsData, function(fields, key) {

                fields = fields.map(function(field) {

                    switch (field.type) {
                        case 'Text':
                        case 'Date':
                        case 'Number':
                        case 'TemplatedURL':
                            return (<FieldInput key={field.name} ref={field.name} field={field} />);

                        case 'DDL':
                        case 'DropDown':
                        case 'MultipleSelectionList':
                            return (<FieldSelect key={field.name} ref={field.name} field={field} onChange={field.name === 'project' ? this.onSelectProject : null} />);

                        case 'CheckBox':
                            return (<FieldCheckbox key={field.name} ref={field.name} field={field} />);

                        case 'URL':
                            return (<FieldUrl key={field.name} ref={field.name} field={field} />);

                        default:
                            return null;
                    }
                }.bind(this));
                return [key, _.compact(fields)];
            }.bind(this)));

            var alert;
            var entity;

            if (this.state.status === 'success') {
                alert = <div className="alert alert-success">Entity is added</div>;

                entity = <Card restApi={this.props.restApi} entity={this.state.entity} />;

            } else if (this.state.status === 'failure') {
                alert = <div className="alert alert-danger">{this.state.statusText}</div>;
            }

            var fieldsetCustom;
            if (groupFields.custom && groupFields.custom.length) {
                var hasVisible = Boolean(_.where(groupFieldsData.custom, {isVisible: true}).length);
                var className = React.addons.classSet({
                    'fieldset-customfields': true,
                    'hidden': !hasVisible
                });

                fieldsetCustom = (<fieldset className={className}>
                    {groupFields.custom}
                </fieldset>);
            }

            return (
                <form action="#" onSubmit={this.onSubmit} className={this.state.validate ? 'validate' : null}>
                    <fieldset className="fieldset-main">
                        {alert}
                        {entity}
                        {groupFields.main}
                    </fieldset>
                    {fieldsetCustom}
                    <fieldset>
                        <button className="btn btn-success btn-lg btn-block ladda-button" data-style="expand-left"  type="submit">
                            <span className="ladda-label">Add</span>
                        </button>
                    </fieldset>
                </form>
            );
        }
    });
});
