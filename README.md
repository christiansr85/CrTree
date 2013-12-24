CrTree
======

This a tree component, based on jQuery, with basic functionalities.

The class "CrTreeNodeOperation" lets user to define icons with specific actions. The properties of the class,

	/**
	* This property defines the css class to use for the icon.
	* @property icon
	* @type {String}
	* @default null
	*/
    icon: null,

    /**
	* This property defines the position of the icon in the node. The possible values are: 
	* 'before'(default), to draw the icon before the text of the node; 'after', to render the icon after the text of the node.
	* @property position
	* @type {String}
	* @default 'before'
	*/
    position: 'before',

	/**
	* This property defines the function to execute when the icon is clicked. This function uses the clicked node as parameter.
	* @property action
	* @type {Function}
	* @default null
	*/
    action: null,

	/**
	* This property defines if the 'click' action over the icon will be propagated to the node or not. If true, the node will NOT execute
	* its select action. If true, the entire node will be selected.
	* @property stopEvtPropagation
	* @type {Boolean}
	* @default false
	*/
    stopEvtPropagation: false,

	/**
	* This property defines the css class apply to the icon container.
	* @property cssClass
	* @type {String}
	* @default null
	*/
    cssClass: null

With the comments, user can easily know the intention of every property and its effect on the tree.
