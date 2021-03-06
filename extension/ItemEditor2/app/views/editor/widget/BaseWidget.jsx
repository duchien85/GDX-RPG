import React from 'react';

export default class BaseWidget extends React.Component{

	state = {obj: null, enable: true}

	constructor(props){
		super(props);

		this.update();
		this.set(undefined, props);
	}

	defaultValue(){
		return null;
	}

	/**
	 * 当内容变更时，尝试向上调用#requireGet()
	 */
	change(value){
		this.state.obj = value;
		this.setState(this.state);

		const check = this.check();

		this.props.editor.error(!check);

		if(!check)
			return this.error(true);

		this.error(false);
		this.message("change");
	}

	_child2obj(child, parent){
		child.filter(c => c.state.enable && (c.props.from || c.props.to)).forEach(c => (c.props.to || c.props.from).split(" ").forEach(to => parent[to] = c.get(parent)));
		return parent;
	}
	/**
	 * 获取当前组件的值，可能是Object(bind)或者基本类型
	 */
	get(parent, root = false){
		if(this.props.child){
			return this._child2obj(this.child(), root ? parent : {});
		}else{
			if(this.check())
				return this.postValue(this.state.obj);

			return this.postValue(this.props.defaultValue || this.defaultValue());
		}
	}

	set(value, props = this.props){
		if(props.parent){
			let parent = props.parent;
			if(value === undefined)
				this.state.obj = this.preValue(parent[props.from] === undefined ? (this.props.defaultValue || this.defaultValue()) : parent[props.from]);
			else
				this.state.obj = this.preValue(value);
		}else{
			this.state.obj = this.preValue(value || props.from);
		}

		if(props.child && value){
			this.child().forEach(c => c.set(value[c.props.from] || c.props.defaultValue || c.defaultValue()));
		}
	}

	/**
	 * dom(change) => parent(change) => ... => root(change) => editor(change, update) => root(update) => ... parent(update) => dom(update)
	 */
	update(){
		let enable = true;

		if(this.props.toggle !== undefined){
			const root = this.props.editor.getObject();

			const __value = this.props.when;
			let __exp = this.props.toggle;

			enable = eval(__exp + " == __value");
		}

		//this.setState({enable: enable});
		this.state.enable = enable;

		if(this.props.child && enable)
			this.child().forEach(c => c.update());
	}

	child(){
		let child = [];
		let i = 0;
		while(true){
			let ref = this.refs["ref" + i++];
			if(!ref)
				break;

			child.push(ref);
		}
		return child;
	}

	render(){
		if(this.state.enable)
			return this.draw();

		return null;
	}


	/**
	 * 向root dom传递信息
	 */
	message(msg){
		//root
		if(!this.props.parent){

			if(msg === "change"){
				let obj = this.get({}, true);
				this.props.editor.change(obj);
				return;
			}


		//
		}else{
			return this.props.message(msg);
		}
	}

	//editor(value) => preValue => dom
	preValue(value){
		return value;
	}

	//dom(value) => postValue => editor
	postValue(value){
		return value;
	}

}

