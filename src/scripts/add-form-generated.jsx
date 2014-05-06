define([], function(){
    'use strict';

    return React.createClass({

        getInitialState: function() {
            return {
                fields: [],
                processId: null,
                entity: null
            };
        },

        componentDidMount: function() {

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
                        attach: attach
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
            var values = $(this.getDOMNode()).serializeArray();

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

        renderFieldInput: function(data) {

            var classSet = React.addons.classSet({
                "form-group": true,
                "hidden": !data.isVisible
            });

            return (
                <div className={classSet} key={data.name}>
                    {data.isCustomField ? <label htmlFor={data.name}>{data.caption}</label> : '' }
                    <input name={data.name} id={data.name} className="form-control" type={data.inputType} defaultValue={data.config.defaultValue} placeholder={data.isCustomField ? null : data.caption} required={data.required} />
                </div>
            );
        },

        renderFieldCheckbox: function(data) {

            var classSet = React.addons.classSet({
                "checkbox": true,
                "hidden": !data.isVisible
            });

            return (
                <div className={classSet} key={data.name}>
                    <label>
                        <input name={data.name} type="checkbox" required={data.required} />
                        {data.caption}
                    </label>
                </div>
            );
        },

        renderFieldSelect: function(data) {

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
                    <select name={data.name} className="form-control" defaultValue={data.config.defaultValue} required={data.required} multiple={data.multiple}
                        onChange={data.name === 'project' ? this.onSelectProject : null}>
                        {options}
                    </select>
                </div>
            );
        },

        renderFieldURL: function(data) {

            return (
                <div className={data.isVisible ? null : 'hidden'}>
                    <div className="form-group" key={data.name + '_u'}>
                        <label>{data.caption}</label>
                        <input name={data.name + '__url'} required={data.required} className="form-control" type="url" placeholder='URL' />
                    </div>
                    <div className="form-group" key={data.name + '_d'}>
                        <input name={data.name + '__url'} required={data.required} className="form-control" type="text" placeholder='URL Description' />
                    </div>
                </div>

            );
        },

        render: function() {
            var fields = this.state.fields;

            fields = fields.map(function(field) {

                switch (field.type) {
                    case 'Text':
                    case 'Date':
                    case 'Number':
                    case 'TemplatedURL':
                        return this.renderFieldInput(field);

                    case 'DDL':
                    case 'DropDown':
                    case 'MultipleSelectionList':
                        return this.renderFieldSelect(field);

                    case 'CheckBox':
                        return this.renderFieldCheckbox(field);

                    case 'URL':
                        return this.renderFieldURL(field);

                    default:
                        return null;
                }
            }.bind(this));
            fields = _.compact(fields);

            var alert;
            var entity;
            // debugger;
            if (this.state.status === 'success') {
                alert = <div className="alert alert-success">Entity is added</div>;

                entity = (
                    <div className="media">
                        <span className="pull-left">
                            <img src={this.state.attach.thumbnailUrl.replace(/localhost/, 'localhost:8080').replace(/100/g, '50')} className="img-rounded media-object" />
                        </span>
                        <div className="media-body">
                            <h5 className="media-heading"><a href="#">{'#' + this.state.entity.id}</a> {this.state.entity.name}</h5>
                        </div>
                    </div>
                );

            } else if (this.state.status === 'failure') {
                alert = <div className="alert alert-danger">{this.state.statusText}</div>;
            }



            return (
                <form action="#" onSubmit={this.onSubmit}>
                    {alert}
                    {entity}
                    {fields}

                    <button className="btn btn-success btn-lg btn-block ladda-button" data-style="expand-left"  type="submit">
                        <span className="ladda-label">Add</span>
                    </button>
                </form>
            );
        }
    });
});
