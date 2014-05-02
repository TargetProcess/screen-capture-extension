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
            this.props.restApi.getForm(this.props.restId)
            .then(function(fields) {

                var project = _.findWhere(fields, {
                    id: 'project'
                });
                var processId = _.findWhere(project.options.values, {
                    id: project.options.selectedValue
                }).processId;

                this.setState({
                    processId: Number(processId),
                    fields: fields
                });
            }.bind(this));

            // this.props.fieldService.on('change', function(field) {
            //     this.fields.find(field.name).defaultValue = value;
            //     this.setValue({fields: fields});
            // })
        },

        onSelectProject: function(e) {
            // console.log($(e.target).find('option:selected'));
            var processId = Number($(e.target).find('option:selected')[0].dataset.processId);
            if (processId) {
                this.setState({
                    processId: processId
                });
            }
        },

        onSubmit: function(e) {

            e.preventDefault();
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

            values = values.map(function(v){
                if (Array.isArray(v.value)) {
                    v.value = JSON.stringify(v.value);
                }

                return v;
            });

            this.props
            .restApi.submitForm(this.props.restId, values)
            .then(function(entity) {
                return Q.all([entity, this.props.restApi.postAttach(entity.id, this.props.paintManager.canvas.toDataURL())]);
            }.bind(this))
            .spread(function(entity){

                this.setState({
                    status: 'success',
                    entity: entity
                });

            }.bind(this))
            .catch(function(err) {
                this.setState({
                    status: 'failure'
                });
            }.bind(this));
        },

        renderFieldText: function(data) {

            var name = (data.id === 'CustomFields') ? (data.id + '__' + data.caption) : data.id;

            return (
                <div className="form-group" key={name}>
                    <input name={name} className="form-control" type="text" placeholder={data.caption} />
                </div>
            );
        },

        renderFieldCheckbox: function(data) {
            // debugger;
            var name = (data.id === 'CustomFields') ? (data.id + '__' + data.caption) : data.id;

            return (
                <div className="checkbox" key={name}>
                    <label>
                        <input name={name} type="checkbox" />
                        {data.caption}
                    </label>
                </div>
            );
        },

        renderFieldDate: function(data) {

            var name = (data.id === 'CustomFields') ? (data.id + '__' + data.caption) : data.id;

            return (
                <div className="form-group" key={name}>
                    <input name={name} className="form-control" type="date" placeholder={data.caption} />
                </div>
            );
        },

        renderFieldNumber: function(data) {

            var name = (data.id === 'CustomFields') ? (data.id + '__' + data.caption) : data.id;

            return (
                <div className="form-group" key={name}>
                    <input name={name} className="form-control" type="number" placeholder={data.caption} />
                </div>
            );
        },

        renderFieldSelect: function(data) {

            var values = (Array.isArray(data.options.values) ? data.options.values : data.options.value.split('\n').map(function(v){
                return {
                    id: v,
                    title: v
                };
            }));

            var name = (data.id === 'CustomFields') ? (data.id + '__' + data.caption) : data.id;

            var options = values.map(function(v){
                return (<option key={v.id} value={v.id} data-process-id={v.processId}>{v.title}</option>);
            });
            return (
                <div className="form-group" key={name}>

                    <select name={name} className="form-control" defaultValue={data.options.selectedValue} onChange={this.onSelectProject}>
                        {options}
                    </select>
                </div>
            );
        },

        render: function() {

            var fields = this.state.fields.map(function(field) {

                var type = field.fieldType || field.type;
                var processId = field.processId;
                // console.log(type);
                if (processId && processId !== this.state.processId) {
                    return '';
                }

                switch (type) {
                    case 'Text':
                        return this.renderFieldText(field);

                    case 'DDL':
                    case 'DropDown':
                        return this.renderFieldSelect(field);

                    case 'CheckBox':
                        return this.renderFieldCheckbox(field);
                    case 'Date':
                        return this.renderFieldDate(field);

                    case 'Number':
                        return this.renderFieldNumber(field);

                }
            }.bind(this));


            var alert;
            // debugger;
            if (this.state.status === 'success') {
                alert = <div className="alert alert-success">Entity is added</div>;
            } else if (this.state.status === 'failure') {
                alert = <div className="alert alert-danger">Entity error</div>;
            }

            return (
                <form action="#" onSubmit={this.onSubmit}>
                    {alert}
                    {fields}

                    <button className="btn btn-success btn-lg btn-block" type="submit">Add</button>
                </form>
            );
        }
    });
});
