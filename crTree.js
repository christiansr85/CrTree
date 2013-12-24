/*****************************************************************************/
/*                      CR_TREE                                              */
/*****************************************************************************/

var Class = {
    create: function () {
        return function () {
            this.initialize.apply(this, arguments);
        };
    }
};

var CrTreeNodeOperation = Class.create();

/**
* This class defines the operations to add to the nodes of a 'CrTree'.
* @class CrTreeNodeOperation
*/
CrTreeNodeOperation.prototype = {

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
    cssClass: null,

	/**
	* This property stores the configuration given by user.
	* @property conf
	* @type {Object}
	* @default null
	*/
    conf: null,

	/**
	* This property stores the dom object which represents the operation.
	* @property dom
	* @type {Object}
	* @default null
	*/
    dom: null,

	/**
	* This property stores the node owner of the operation.
	* @property node
	* @type {Object} Instance of 'CrTreeNode'.
	* @default null
	*/
    node: null,


    defaults: {
        icon: null,
        // 'before', 'after'
        position: 'before',
        action: function (node) {
            console.log(node.data.text);
        },
        stopEvtPropagation: true,
        cssClass: ''
    },

    initialize: function (node, conf) {

        this.node = node;

        this.conf = $.extend({}, this.defaults, conf);

        this.icon = this.conf.icon;
        this.position = this.conf.position;
        this.action = this.conf.action;
        this.stopEvtPropagation = this.conf.stopEvtPropagation;
        this.cssClass = this.conf.cssClass;

        // Build the dom object
        this._buildDom();

    },

    _buildDom: function () {
        var _self = this;

        var domOperation = $('<section class="crTree-i-container ' + this.position + ' ' + this.cssClass + '"><i class="' + this.icon + '"></i></section>');
        $(domOperation).on('click', function (evt) {
            if (_self.action) {
                _self.action(_self.node);
            }
            if (_self.stopEvtPropagation) {
                evt.stopPropagation();
            }
        });

        this.dom = domOperation;
    },
};

var CrTreeNode = Class.create();

CrTreeNode.prototype = {

    //#region PROPERTIES

    /**
    * Here we store the tree owner of the node.
    * @property tree
    * @type {Object} 'CrTree'
    * @default null
    */
    tree: null,

    /**
    * Here we store the parent of the node. If the node is a root, then this property is null.
    * @property parentNode
    * @type {Object} 'CrTreeNode'
    * @default null
    */
    parentNode: null,

    /**
    * This property defines if the nodes has a main icon or not. This property doesn't affect to the 'operations' option.
    * @property drawIconNode
    * @type {Boolean}
    * @default true
    */
    drawIconNode: true,

    /**
    * This property will contain the configuration of the custom node, i.e., the defaults properties mixed with the given properties.
    * @property data
    * @type {Object}
    * @default null
    */
    data: null,

    /**
    * This property defines if the events associated to the node must propagate the event or not.
    * @property stopEvtPropagation
    * @type {Boolean}
    * @default true
    */
    stopEvtPropagation: true,

    /**
    * This property stores the dom object where the node is placed. This object is the same of the '_childrenContainer' parent's property.
    * @private
    * @property _domContainer
    * @type {Object}
    * @default null
    */
    _domContainer: null,

    /**
    * This property stores the dom object which encloses all the node, including its children.
    * @private
    * @property _dom
    * @type {Object}
    * @default null
    */
    _dom: null,

    /**
    * This property stores the dom object which represents the node. The events are associated to this object.
    * @private
    * @property _domNode
    * @type {Object}
    * @default null
    */
    _domNode: null,

    /**
    * This property stores the dom object which represents expander item.
    * @private
    * @property _expander
    * @type {Object}
    * @default null
    */
    _expander: null,

    /**
    * This property stores the dom object where the children will be placed.
    * @private
    * @property _childrenContainer
    * @type {Object}
    * @default null
    */
    _childrenContainer: null,

    /**
    * This property defines if the node is being collapsed or expanded.
    * @private
    * @property _expandingCollapsing
    * @type {Boolean}
    * @default false
    */
    _expandingCollapsing: false,

    /**
    * This property stores the child nodes of the current node. This nodes are built nodes, i.e., 'CrTreeNode's.
    * @property childNodes
    * @type {Array} Array of 'CrTreeNode'.
    * @default null
    */
    childNodes: null,

    //#region PROPERTIES.CSS

    /**
    * This property defines the default css class to hide any element of the tree.
    * @private
    * @property _defaultHiddenClass
    * @type {String}
    * @default 'crTree-hidden'
    */
    _defaultHiddenClass: 'crTree-hidden',
    
    /**
    * This property defines the css class for the expander element when its status is collapsed.
    * @property cssExpanderCollapsed
    * @type {String}
    * @default 'cr-icon-expander'
    */
    cssExpanderCollapsed: 'cr-icon-expander',

    /**
    * This property defines the css class for the expander element when its status is expanded.
    * @property cssExpanderExpanded
    * @type {String}
    * @default 'cr-icon-expanded'
    */
    cssExpanderExpanded: 'cr-icon-expanded',
    
    //#endregion

    //#region PROPERTIES.ANIMATION

    /**
    * This property defines if the tree will be animated when it expand or collapse nodes.
    * @property animated
    * @type {Boolean}
    * @default true
    */
    animated: true,

    /**
    * This property defines which property of the dom object will be modified in the animation.
    * @property animation
    * @type {String}
    * @default 'height'
    */
    animation: 'height',

    /**
    * This property defines the duration of the animation.
    * @property animationTime
    * @type {Numeric}
    * @default 300
    */
    animationTime: 300,

    //#endregion

    //#region PROPERTIES.DEFAULTS

    /**
    * This property defines the defaults properties for the content of the node. Those are the mandatory properties.
    * @property defaults
    * @type {Object} Raw object with default properties.
    * @default {obj}
    */
    defaults: {
        id: '',
        expanded: false,
        expandable: false,
        text: '',
        children: null,

        icon: null,
        iconBusy: 'cr-icon-busy',

        operations: [
                    //{
                    //    icon: 'icon-exclamation red',
                    //    position: 'before',
                    //    action: function (node) {
                    //        console.log('op red: ' + node.data.text);
                    //    },
                    //    stopEvtPropagation: true,
                    //    cssClass: ''
                    //},
                    //{
                    //    icon: 'icon-exclamation yellow',
                    //    position: 'before',
                    //    action: function (node) {
                    //        console.log('op yellow: ' + node.data.text);
                    //    },
                    //    stopEvtPropagation: true,
                    //    cssClass: ''
                    //}

        ]

    },

    //#endregion

    //#region PROPERTIES.EVENTS

    /**
    * This property is an event executed when a node is going to be expanded.
    * @property onNodeExpand
    * @type {Function}
    * @default null
    */
    onNodeExpand: null,

    /**
    * This property is an event executed when a node is going to be collapsed.
    * @property onNodeCollpase
    * @type {Function}
    * @default null
    */
    onNodeCollpase: null,

    /**
    * This property is an event executed when a node is selected.
    * @property onNodeSelect
    * @type {Function}
    * @default null
    */
    onNodeSelect: null,

    /**
    * This property is an internal event executed when a node has been expanded, when the children has been retrieved.
    * This is useful when nodes are loaded after a server call. This event is executed after retrieve the response.
    * @private
    * @property _expandedCallback
    * @type {Function}
    * @default null
    */
    _expandedCallback: null,

    //#endregion

    //#endregion

    //#region METHODS

    //#region METHODS.INIT

    /**
    * This is the method which initializes the node.
    * @method initialize
    * @param {Object} tree A tree of 'CrTree' class.
    * @param {Object} container The dom object where to place the node.
    * @param {Object} parent A 'CrTreeNode' object, which is the parent of the current node.
    * @param {Object} data The configuration of the current node.
    */
    initialize: function (tree, container, parent, data) {

        // Store the tree owner of this node
        this.tree = tree;
        // Store the parent node of the item
        this.parentNode = parent;

        // Mix the data given with the defaults of the object
        this.data = $.extend({}, this.defaults, data);

        // Set some properties defined by the tree
        this._setTreeProperties();

        // Store the dom container
        this._domContainer = container;
        // Build the node and its children (if it has children)
        this._buildNode(this._domContainer, this.parentNode, this.data);

        // Register the node in the tree
        this.tree.registerNode(this);
    },

    //#endregion

    //#region METHODS.PUBLIC
        
    /**
    * This method selects a node of the tree. Here we execute the 'onNodeSelect' event if defined.
    * @method select
    */
    select: function () {

        // Set the node selected visually 
        $('.crTree .cr-selected-node').removeClass('cr-selected-node');
        $(this._domNode).addClass('cr-selected-node');

        // Trigger the 'onNodeSelect' event if defined.
        if (this.onNodeSelect) {
            this.onNodeSelect(this);
        }
    },

    /**
    * This method expands or collapse the node, updating its 'expanded' property. Here we execute the 'onNodeExpand' event
    * if the node is being expanded, or the 'onNodeCollpase' event if the node is being collpased.
    * @method expand
    * @param {Function} callback (Optional)This method is executed once the node is completely expanded or collapsed. This is useful
    *   when you load nodes from server and you want to executed an action after the children has been retrieved.
    */
    expand: function (callback) {

        // Only execute the expand action if node is yet expanding or collapsing
        if (!this.isExpandingCollapsing()) {

            // Set the icon busy
            this.setBusy();

            // Update the '_expandingCollapsing' property
            this._expandingCollapsing = true;

            this._expandedCallback = callback;

            // Update the expanded status
            this.data.expanded = !this.data.expanded;

            // Check if we are expanding or collapsing
            if (this.data.expanded) {
                // If there is any 'onNodeExpand' function defined, then execute it
                if (this.onNodeExpand) {
                    this.onNodeExpand(this);
                }
            }
            else {
                // If there is any 'onNodeCollpase' function defined, then execute it
                if (this.onNodeCollpase) {
                    this.onNodeCollpase(this);
                }
            }

            // Expand the children container
            this._expandChildrenContainer();
        }
    },

    /**
    * This method adds new children to the current node. The new children added are of 'CrTreeNode' type.
    * @method addChildren
    * @param {Array} newChildren The collection of raw chilren to add to the node.
    */
    addChildren: function (newChildren) {
        // Build the nodes from the raw children
        var childrenBuilt = this._buildNodes(this._childrenContainer, this, newChildren);
        if (!this.childNodes) {
            this.childNodes = [];
        }
        // Add the built nodes as children of the current one
        this.childNodes = this.childNodes.concat(childrenBuilt);

    },

    /**
    * This method adds new children and expand the node. Here we execute the callback associated to the node to be executed after expanding it.
    * @method addChildrenExpanding
    * @param {Array} newChildren The collection of raw chilren to add to the node.
    */
    addChildrenExpanding: function (newChildren) {

        // Add the children to the node
        this.addChildren(newChildren);
        // If there is any callback function, then execute it
        if (this._expandedCallback) {
            this._expandedCallback(this);
        }
        
        // If the node is animated, apply the proper animation to it
        if (this.animated) {
            // Hide the container of the children to apply the animation to the added children
            $(this._childrenContainer).css({
                display: 'none'
            });
            // Animate the epxanding
            this._animate();
        }        

        // Update the '_expandingCollapsing' property
        this._expandingCollapsing = false;
    },

    /**
    * This method indicates if the node has children or not.
    * @method hasChildren
    * @return {Boolean} True if the node has children. False instead.
    */
    hasChildren: function () {
        return (this.childNodes != null && this.childNodes.length > 0);
    },

    /**
    * This method indicates if the node has children or not.
    * @method isExpandingCollapsing
    * @return {Boolean} True if the node is being expanded or collapsed. False instead.
    */
    isExpandingCollapsing: function () {
        return this._expandingCollapsing;
    },

    /**
    * This method indicates if the node is expanded or not.
    * @method isExpanded
    * @return {Boolean} True if the node is expanded. False instead.
    */
    isExpanded: function(){
        return this.data.expanded;
    },

    /**
    * This method indicates if the node is collapsed or not.
    * @method isCollapsed
    * @return {Boolean} True if the node is collapsed. False instead.
    */
    isCollapsed: function(){
        return !this.isExpanded();
    },

    /**
    * This method indicates if the node is expandable or not.
    * @method isExpandable
    * @return {Boolean} True if the node is expandable. False instead.
    */
    isExpandable: function () {
        return this.data.expandable;
    },

    /**
    * This method sets the node in a busy state.
    * @method setBusy
    */
    setBusy: function () {

        // Remove any previous class for the expander
        $(this._expander).find('i').removeClass(this.cssExpanderCollapsed);
        $(this._expander).find('i').removeClass(this.cssExpanderExpanded);
        // Add the busy class
        $(this._expander).find('i').addClass(this.data.iconBusy);
    },

    /**
    * This method sets the node in a idle state.
    * @method setIdle
    */
    setIdle: function () {

        // Remove the busy class
        $(this._expander).find('i').removeClass(this.data.iconBusy);

        // Add the proper icon
        var cssClass = this.cssExpanderCollapsed;
        if (this.isExpanded()) {
            cssClass = this.cssExpanderExpanded;
        }
        $(this._expander).find('i').addClass(cssClass);        

    },

    //#endregion

    //#region METHODS.PRIVATE

    /**
    * This method sets some common properties for all nodes, defined in the tree specification.
    * @private
    * @method _setTreeProperties
    */
    _setTreeProperties: function () {

        // Get the tree options
        var _treeOptions = this.tree.getOptions();

        // Set properties
        this.drawIconNode = _treeOptions.drawIconNode;
        this.cssExpanderCollapsed = _treeOptions.cssClassExpander[0];
        this.cssExpanderExpanded = _treeOptions.cssClassExpander[1];

        // Animation properties
        this.animated = _treeOptions.nodeAnimated;
        this.animation = _treeOptions.nodeAnimation;
        this.animationTime = _treeOptions.nodeAnimationTime;

        // Set the actions defined by the tree
        this.onNodeExpand = _treeOptions.onNodeExpand;
        this.onNodeCollpase = _treeOptions.onNodeCollpase;
        this.onNodeSelect = _treeOptions.onNodeSelect;

    },

    /**
    * This method changes visually the expander of the node.
    * @private
    * @method _expandChildrenContainer
    */
    _expandChildrenContainer: function () {
                
        if (this.animated) {
            // Animate the epxanding
            this._animate();
        }
        else {
            if (this.data.expanded) {
                // Show the children
                $(this._childrenContainer).removeClass(this._defaultHiddenClass);
            }
            else {
                // Hide the children
                $(this._childrenContainer).addClass(this._defaultHiddenClass);
            }
        }

        if (this.hasChildren()) {
            if (this._expandedCallback) {
                this._expandedCallback(this);
            }
            // Update the '_expandingCollapsing' property
            this._expandingCollapsing = false;

            this.setIdle();
        }        
    },

    /**
    * This method is executed to add an animation when a node is expanded or collapsed.
    * @private
    * @method _animate 
    */
    _animate: function () {

        var _self = this;

        // Get the property for the animation
        var conf = {};
        conf[this.animation] = 'toggle';
        // Animate the container of children
        $(this._childrenContainer).animate(conf, this.animationTime, 'swing', function () {
            // Set idle the expander icon
            _self.setIdle();
        });
    },

    /**
    * This method builds a single node of the tree.
    * @private
    * @method _buildNode
    */
    _buildNode: function (container, parent, data) {

        var result = null;

        var _self = this;

        // If we don't have a tooltip defined, then set the text field as tooltip
        if (!data.tooltip) {
            data.tooltip = data.text;
        }

        // Build the dom node container
        this._dom = $('<li title="' + data.tooltip + '"></li>');

        // Draw the node
        this._drawNode();

        // Create the children container
        this._childrenContainer = $('<ul class="' + this._defaultHiddenClass + '"></ul>');
        $(this._dom).append(this._childrenContainer);

        // Append the node to the container
        if (container) {
            $(container).append(this._dom);
        }

        // Add a click listener to the node
        this._addNodeListener_onClick();

        // If this node has children, build them too
        if (this.data.children && this.data.children.length > 0) {
            this.addChildren(this.data.children);
        }

        result = this;

        return result;
    },

    /**
    * This method draws the node from the given configuration.
    * @private
    * @method _drawNode
    */
    _drawNode: function () {

        this._domNode = $('<section></section>');
        $(this._dom).append(this._domNode);

        // Draw the expander object
        this._drawExpander();

        // Set the default icon to the node if needed
        this._drawIcon();

        // Draw the inner info of the node: text, icons...
        this._drawInnerNode();

    },

    /**
    * This method draws the expander element for the node.
    * @private
    * @method _drawExpander
    */
    _drawExpander: function () {
        var expanderContainer = $('<section class="expander-container"></section>');
        this._expander = expanderContainer;
        $(this._domNode).append(expanderContainer);
        if (this.data.expandable) {
            var expanderClass = this.cssExpanderCollapsed;
            if (this.data.expanded) {
                expanderClass = this.cssExpanderExpanded;
            }
            var expander = $('<i></i>').addClass(expanderClass);

            // Add a listener for the expander
            this._addExpanderListener_onClick();

            $(expanderContainer).append(expander);
        }
    },

    /**
    * This method draws the main icon for the node.
    * @private
    * @method _drawIcon
    */
    _drawIcon: function () {
        // Set the default icon to the node
        if (this.drawIconNode) {
            // Check if we have already defined an icon for the node. If not, then assign one by default
            if (!this.data.icon) {
                this.data.icon = 'cr-icon-folder';
                if (!this.data.expandable) {
                    this.data.icon = 'cr-icon-leaf';
                }
            }

            var iconContainer = $('<section class="crTree-i-container"><i class="' + this.data.icon + '"></i></section>');
            $(this._domNode).append(iconContainer);
        }
    },

    /**
    * This method draws the inner content of a node.
    * @private
    * @method _drawInnerNode
    */
    _drawInnerNode: function () {

        var _self = this;

        // Get the operations if there is any
        var beforeOperations = this._getBeforeOperations();
        var afterOperations = this._getAfterOperations();

        //Create the text field
        var text = $('<span>' + this.data.text + '</span>');

        // Add the operations before the text node
        if (beforeOperations) {
            $.each(beforeOperations, function (index, op) {
                $(_self._domNode).append(op.dom);
            });
        }

        // Add the inner node info to the node
        $(this._domNode).append(text);

        // Add the operations after the text node
        if (afterOperations) {
            $.each(afterOperations, function (index, op) {
                $(_self._domNode).append(op.dom);
            });
        }
    },

    /**
    * This method gets all raw operations which will be placed BEFORE the node text.
    * @private
    * @method _getBeforeOperations
    * @return {Array} An array of raw operations.
    */
    _getBeforeOperations: function () {
        var result = null;

        var _self = this;

        var _operations = this.data.operations;
        if (_operations) {
            // Look for the 'before' elements
            var beforeElements = [];
            $.each(_operations, function (index, value) {
                if (value.position === 'before') {
                    beforeElements.push(value);
                }
            });

            var beforeOperations = [];
            $.each(beforeElements, function (index, item) {
                var operation = _self._createOperation(item);
                beforeOperations.push(operation);
            });
            result = beforeOperations;
        }

        return result;
    },

    /**
    * This method gets all raw operations which will be placed AFTER the node text.
    * @private
    * @method _getAfterOperations
    * @return {Array} An array of raw operations.
    */
    _getAfterOperations: function () {
        var result = null;

        var _self = this;

        var _operations = this.data.operations;
        if (_operations) {
            // Look for the 'after' elements
            var afterElements = [];
            $.each(_operations, function (index, value) {
                if (value.position === 'after') {
                    afterElements.push(value);
                }
            });

            var afterOperations = [];
            $.each(afterElements, function (index, item) {
                var operation = _self._createOperation(item);
                afterOperations.push(operation);
            });
            result = afterOperations;
        }

        return result;
    },

    /**
    * This method creates an operation from its raw specifications.
    * @private
    * @method _createOperation
    * @param {Object} rawOperation The raw data of the operation.
    * @return {Object} An instance of 'CrTreeNodeOperation'.
    */
    _createOperation: function (rawOperation) {
        var result = null;

        var _self = this;

        if (rawOperation) {
            var operation = new CrTreeNodeOperation(this, rawOperation);
            result = operation;
        }

        return result;
    },

    /**
    * This method builds nodes for the tree. Here we have a collection of raw nodes, and build a 'CrTreeNode' for each one.
    * @private
    * @method _buildNodes
    * @param {Object} container The dom object where the new nodes will be placed.
    * @param {Object} parent A 'CrTreeNode' object, parent of this one. If this parameter is null, we can suppose the nodes we're 
    *   going to create are the roots of the tree.
    * @param {Array} children The raw children to build the 'CrTreeNodes' from.
    * @return {Array} A list of built 'CrTreeNode'.
    */
    _buildNodes: function (container, parent, children) {

        var result = null;

        if (children && children.length > 0) {

            // Craete an array to store the created children
            var _childrenBuilt = [];

            var tree = this.tree;
            $.each(children, function (index, value) {
                //var _child = this._buildNode(container, parent, value);
                var _child = new CrTreeNode(tree, container, parent, value);
                _childrenBuilt.push(_child);
            });

            result = _childrenBuilt;
        }


        return result;
    },

    /**
    * This method adds a click listener to this node. Here we execute the 'select' method of the node.
    * @private
    * @method _addNodeListener_onClick
    */
    _addNodeListener_onClick: function () {
        var node = this;
        $(this._domNode).on('click', function (evt) {
            node.select();
            if (node.stopEvtPropagation) {
                evt.stopPropagation();
            }
        });
    },

    /**
    * This method adds a click listener to the expander of the node. This method changes the class of the expander icon, in function
    * of its state (expanded of collapsed) and executes the 'expand' method of the node selected.
    * @private
    * @method _addExpanderListener_onClick
    */
    _addExpanderListener_onClick: function () {
        var node = this;
        var expander = this._expander;
        $(expander).on('click', function (evt) {            
            node.expand();
            // Stop the event propagation
            evt.stopPropagation();

        });
    }

    //#endregion

    //#endregion

};

(function ($) {
    'use strict';

    // PRIVATE PROPERTIES

    var _options = {};
    var _container = {};

    var _treeContainer = null;
    var _root = null;

    var _nodes = null;
    var _nodesRegister = null;

    // CONSTRUCTOR

    $.fn.CrTree = function (options) {
        _options = $.extend({}, $.fn.CrTree.defaults, options);
        _nodes = [];
        _nodesRegister = [];

        return this.each(function () {
            _container = $(this);
            _init();
        });

    };

    // PUBLIC FUNCTIONS

    $.extend($.fn.CrTree, {

        /**
        * This method is used to find an item through a value, by its id. If the 'field' parameter is given, then 
        * here we search a node with a match between the value and the node's value in that field.
        * @method findItem
        * @param {Any} value The value to match with the desired item.
        * @param {String} field (Optional)The field to look for the node by.
        * @return {Object} A 'CrTreeNode', the first object which matches with the given value.
        */
        findItem: function (value, field) {

            var result = null;

            var _field = field;
            // If the 'field' parameter is not given or is the 'id' field
            if (!_field || _field === 'id') {
                if (_nodesRegister) {
                    // Here we look into the registered nodes to optimize the search
                    var index = _nodesRegister.indexOf(value);
                    if (index != -1) {
                        var node = _nodes[index];
                        result = node;
                    }
                }
            }
            else {
                // Here we must look into the collection of nodes
                var found = false, index = 0, length = _nodes.length;
                while (!found && index < length) {
                    var _node = _nodes[index];
                    // Check if this is the node we are looking for
                    if (_node.data[field] === value) {
                        result = _node;
                    }

                    index++;
                }
            }

            return result;

        },

        /**
        * This method expands an item of the tree. The 'onNodeExpanded' event is executed in this action.
        * @method expandItem
        * @param {Object} item An instance of 'CrTreeNode'.
        * @param {Function} callback (Optional)A callback to execute after the items have been added to the expanded node.
        */
        expandItem: function (item, callback) {
            if (item) {
                item.expand(callback);
            }
        },

        /**
        * This method selects an item of the tree. The 'onNodeSelect' event is executed in this action.
        * @method selectItem
        * @param {Object} item Instance of 'CrTreeNode'.
        */
        selectItem: function (item) {
            if (item) {
                item.select();
            }
        },

        /**
        * This method sets a new root for the tree.
        * @method setRoot
        * @param {Array} items The items to set as root of the tree.
        */
        setRoot: function (items) {
            // Re-build the tree container
            _createTreeContainer();

            //Build the tree nodes and set as root
            var _nodes = _buildNodes(_treeContainer, items);
            _root = _nodes;
        },

        /**
        * This method gets the root of the tree.
        * @method getRoot
        * @return {Array} An array of 'CrTreeNode' who are the roots of the tree.
        */
        getRoot: function () {
            return _root;
        },

        /**
        * This method gives the options of the tree.
        * @method getOptions
        * @return {Object} The tree's options.
        */
        getOptions: function () {
            return _options;
        },

        /**
        * This method registers a node in the tree's register. This register does the searchs by id be more efficient.
        * @method registerNode
        * @param {Object} node Instance of 'crTreeNode'.
        */
        registerNode: function (node) {
            _nodes.push(node);
            _nodesRegister.push(node.data.id);
        },

        /**
        * Retrieve all nodes of the application.
        * @method getNodes
        * @return {Array} An array of 'CrTreeNode' with all the items of the tree.
        */
        getNodes: function () {
            return _nodes;
        }

    });

    // PRIVATE FUNCTIONS

    function _init() {

        // Build the tree container
        _createTreeContainer();

        //Build the tree nodes
        var _nodes = _buildNodes(_treeContainer, null, _options.children);
        _root = _nodes;

        //Trigger the tree completed event
        if (_options.onTreeCompleted) {
            _options.onTreeCompleted();
        }
    };

    function _createTreeContainer() {
        // Clean the reference node where the tree will be placed
        $(_container).empty();
        // Create the anchor structure
        _treeContainer = $(_container)
			.addClass('crTree')
			.append('<ul></ul>')
			.css({
			    height: _options.height,
			    width: _options.width
			})
			.find('ul');
    };

    function _buildNodes(container, parent, children) {

        var result = null;

        var _nodes = [];
        if (children && children.length > 0) {
            $.each(children, function (index, value) {
                var _node = _buildNode(container, parent, value);
                _nodes.push(_node);
            });
        }
        result = _nodes;

        return result;
    };

    function _buildNode(container, parent, node) {

        // Build the node
        var _node = new CrTreeNode($(this).CrTree, container, parent, node);

    }

    // PUBLIC DEFAULT PROPERTIES

    $.fn.CrTree.defaults =
    {
        children: null,
        height: '300px',
        width: '200px',

        stopEvtPropagation: true,
        onNodeSelect: null,
        onNodeExpand: null,
        onNodeCollpase: null,
        onNodeChildrenAdded: null,
        onNodeExpanded: null,

        onTreeCompleted: null,

        // PROPERTIES FOR NODES
        drawIconNode: true,

        cssClassExpander: [
            'cr-icon-expander',
            'cr-icon-expanded'
        ],
        nodeAnimated: true,
        nodeAnimation: 'height',
        nodeAnimationTime: 300
    };

}(jQuery));

