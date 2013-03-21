// PageLines Editor - Copyright 2013

!function ($) {
	
	// --> Initialize 
	$(document).ready(function() {

		$('.pl-sortable-area .pl-section').addClass('pl-sortable')

		$.pageTools.startUp()

	})
    
	// Event Listening
	$.pageTools = {
		
		startUp: function(){
			
			$.pageBuilder.reloadConfig( 'start' )

			this.theToolBox = $('body').toolbox()
			
			$.pageBuilder.showEditingTools() 
			
			$.plAJAX.init() 
			
			$.plTemplates.init()
			
			this.bindUIActions()
				
		}
		
		, bindUIActions: function() {
		
			that = this
			
			// Click event listener
			$(".btn-toolbox").on("click.toolboxHandle", function(e) {
				
				e.preventDefault()
				
				
				var btn = $(this)
				, 	btnAction = btn.data('action')
			
				if( btnAction == 'drag-drop' ){
					$.pageBuilder.showEditingTools()
				
				} else if( btn.hasClass('btn-panel') )
					that.showPanel(btnAction)
				
				
			})
			
			$(".btn-action").on("click.actionButton", function(e) {
			
				e.preventDefault()
		
				var btn = $(this)
				, 	btnAction = btn.data('action')
				
				that.handleActions(btnAction)
				
				
			})
			
		
        }

		, handleActions: function( key ){
			var that = this
			
			if( key == 'reset_global' || key == 'reset_local')
				$.plAJAX.resetOptions( key )
				
			if( key == 'pl-toggle' )
				$.plAJAX.toggleEditor( key )
				
			if( key == 'toggle_grid' )
				that.toggleGrid()
				
		}
		
		, toggleGrid: function(){
			
			if($('body').hasClass('drag-drop-editing')){
				$('body').removeClass('drag-drop-editing width-resize')
			} else 
				$('body').addClass('drag-drop-editing width-resize')
		}
		
		, showPanel: function( key ){
		
			var selectedPanel = $('.panel-'+key)
			, 	selectedTab = $('[data-action="'+key+'"]')
			, 	allPanels = $('.tabbed-set')
			
			$('body').toolbox('show')
			
			store.set('toolboxPanel', key)
			
			if(selectedPanel.hasClass('current-panel'))
				return
			
			$('.btn-toolbox').removeClass('active-tab')
			
			allPanels
				.removeClass('current-panel')
				.hide()
				
			$('.ui-tabs').tabs('destroy')
		
			selectedPanel.tabs({
				create: function(event, ui){
					
					selectedPanel.find('.tabs-nav li').on('click.panelTab', function(){
						var theIsotope = selectedPanel.find('.isotope')
						,	removeItems = $('.x-remove')
						
						if( $(this).data('filter') )
							theIsotope.isotope({ filter: $(this).data('filter') }).isotope('remove', removeItems).removeClass('storefront-mode')
						
					})
				}
				, activate: function(e, ui){
					
					var theTab = ui.newTab
					, 	tabAction = theTab.attr('data-tab-action') || ''
					,	tabPanel = $("[data-panel='"+tabAction+"']")
					,	tabFlag = theTab.attr('data-flag') || ''
					
					if (tabFlag == 'custom-scripts'){
						
						
						$.plCode.activateScripts()
						
					} else if ( tabFlag == 'link-storefront' ){
						
						e.preventDefault()
						
						$('.btn-pl-extend')
							.trigger('click')
					
					}
					
				}
			})
			
			selectedPanel
				.addClass('current-panel')
				.show()
		
		
			// Has to be after shown
			if( key == 'settings'){
				
				var config = {
						mode: 'settings'
						, sid: 'settings'
						, settings: $.pl.config.settings
					}
				
				$.optPanel.render( config )
				
			}
			else if( key == 'live'){
				
				var liveFrame = '<div class="live-wrap"><iframe class="live_chat_iframe" src="http://pagelines.campfirenow.com/6cd04"></iframe></div>'

				selectedPanel
					.find('.panel-tab-content')
					.html(liveFrame)
				
			}
			
			 else if (key == 'pl-design'){
				$.plCode.activateLESS()
				
			} else if (key == 'section-options'){
				
				$('body').toolbox({
					action: 'show'
					, panel: key
					, info: function(){
					
						$.optPanel.render( config )
					
					}
				})
				
			} 
		
			selectedTab.addClass('active-tab')
			
			$.xList.listStop()
			
			$.xList.listStart(selectedPanel, key)
			
		}
		
		, stateInit: function( key, call_on_true, call_on_false, toggle ){
			
			var localState = ( localStorage.getItem( key ) )
			,	theState = (localState == 'true') ? true : false
			 
			
			if( toggle ){
				theState = (theState) ? false : true;
				localStorage.setItem( key, theState )
			}
			
			if (!theState){
					
				$('[data-action="'+key+'"]').removeClass('active-tab')	
					
				if($.isFunction(call_on_false))
					call_on_false.call( key )
			}
			
			if (theState){
				
				$('[data-action="'+key+'"]').addClass('active-tab')
					
				if($.isFunction(call_on_true))
					call_on_true.call( key )
			}
				
				
			
			
		}

	
	}
	
	$.xList = {
		
		renderList: function( panel, list ){
			var items = ''
		
			// console.log(list)
			// return
			$.each( list , function(index, l) {
			
				items += sprintf('<div class="x-item %s"><div class="x-item-frame"><img src="%s" /></div></div>', l.class, l.thumb)
			})
			
			output = sprintf('<div class="x-list">%s</div>', items)
		
			panel.find('.panel-tab-content').html( output )
			
			
		}
		
		, listStart: function( panel, key ){
		
			var that = this
			,	layout = (key == 'pl-extend') ? 'masonry' : 'fitRows'; 
			
			panel.imagesLoaded( function(){
				panel.find('.x-list').isotope({
					itemSelector : '.x-item'
					, layoutMode : layout
					, sortBy: 'number'
					, getSortData : {
						number : function ( $elem ) {
							return $elem.data('number');
						}
					}
				})
			})
			
			//this.listPopOverStart()
			
			if(key == 'add-new')
				this.makeDraggable(panel)
				
			
			this.extensionActions()
				
			
				
		}
		
		, loadButtons: function( panel, data ){
			var buttons = ''
			
			if(panel == 'x-store'){
				buttons += $.plExtend.actionButtons( data )
			} else if ( panel == 'x-themes' ){
				buttons += $.plThemes.actionButtons( data )
			} else if ( panel == 'x-sections' ){
				buttons += sprintf('<a href="#" class="btn btn-small disabled"><i class="icon-random"></i> Drag Thumb to Page</a> ')
			}
			
			
			return buttons
		}
		
		, loadPaneActions: function(panel){
			
			if(panel == 'x-store'){
				$.plExtend.btnActions()
			} else if ( panel == 'x-themes' ){
				$.plThemes.btnActions()
			} 
			
			$('.x-close').on('click.paneAction ', function(e){
	
				e.preventDefault

				var theIsotope = $(this).parent()
				,	removeItems = $('.x-remove')
				
				removeItems
					.off('click')

				theIsotope
					.isotope({ filter: '*' })
					.isotope('remove', removeItems)
					.removeClass('x-pane-mode')


			})
		}

		, extensionActions: function(){
	
			var that = this
			$('.x-extension').on('click.extensionItem', function(){
				var theExtension = $(this)
				,	theIsotope = $(this).parent()
				,	theID = $(this).data('extend-id')
				,	filterID = 'filter-'+theID
				,	filterClass = '.'+filterID
				,	ext = $.pl.config.extensions[theID] || false
				,	panel = theIsotope.data('panel') || false

				if(!theIsotope.hasClass('x-pane-mode') && ext){
					
					var splash	= sprintf('<div class="x-pane-frame"><img src="%s" /></div>', ext.splash)
					,	btnClose = sprintf('<div class="x-item x-close x-remove %s"><a href="#" class="btn btn-close"><i class="icon-remove"></i></a></div>', filterID)
					,	btns = sprintf('<div class="x-pane-btns">%s</div>', that.loadButtons( panel, theExtension.data() ))
					,	desc = sprintf('<div class="x-pane-info"><h4>Description</h4>%s</div>', ext.desc)
					,	extPane = $( sprintf('<div class="x-pane x-remove x-item %s" data-extend-id="%s"><div class="x-pane-pad">%s %s %s</div></div>%s', filterID, theID, splash, btns, desc, btnClose) )

					if( panel == 'x-sections' ){
						var prep = sprintf('<span class="x-remove badge badge-info %s"><i class="icon-arrow-up"></i> Drag This</span>', filterID)
						
						theIsotope.find('.pl-sortable').append(prep)
					}
						
				
					theIsotope
						.isotope('insert', extPane)
						.isotope({filter: filterClass})
						.addClass('x-pane-mode')
				} 
	
				// load actions after elements added to DOM
				that.loadPaneActions( panel )
				
				
			})
			
			
	
			
		
		}

		, listPopOverStart: function(){
			$('.x-item').popover({
				template: '<div class="popover x-item-popover"><div class="arrow"></div><div class="popover-content"></div></div>'
				, trigger: 'hover'
				, html: true
				, container: $('.pl-toolbox')
				, placement: 'top'
			})
		
		}
		
		, listPopOverStop: function(){
			$('.x-item').popover('destroy')
			
		
		}
		
		, makeDraggable: function(panel){
			
			list = this
		
			panel.find( '.x-item:not(.x-disable)' ).draggable({
					appendTo: "body"
				, 	helper: "clone"
				, 	cursor: "move" 
				, 	connectToSortable: ".pl-sortable-area"
				,	zIndex: 10000
				,	distance: 20
				, 	start: function(event, ui){
				
						list.switchOnAdd(ui.helper)
						ui.helper
							.css('max-width', '300px')
							.css('height', 'auto')
							
					
					}
			})
		
			
		}
		, listStop: function(){
			
			var removeItems = $('.x-remove')
			
			removeItems
				.off('click')
					
			$('.x-extension')
				.off('click.extensionItem')
					
		 	$('.x-list.isotope')
				.removeClass('x-pane-mode')
				.isotope( 'remove', removeItems)
				.isotope( { filter: '*' })
				.isotope( 'destroy' )
		
			//this.listPopOverStop()
		}
		
		, switchOnAdd: function( element ){
			
			
			var name = element.data('name')
			, 	image = element.data('image')
			, 	imageHTML = sprintf('<div class="pl-touchable banner-frame"><div class="pl-vignette pl-touchable-vignette"><img class="section-thumb" src="%s" /></div></div>', image )
			, 	text = sprintf('<div class="banner-title">%s</div>', name )
			, 	theHTML = sprintf('<div class="pl-refresh-banner">%s %s</div>', imageHTML, text)
			
			
			element
				.removeAttr("style")
				.html(theHTML)
				
			if(!element.hasClass('ui-draggable-dragging'))
				element.hide()
				
		}
		, switchOnStop: function( element ){
			element.addClass('pl-section')
			
			$.pageBuilder.handleCloneData( element )
			
			if(!element.hasClass('ui-draggable-dragging'))
				element.show()
			
			$.pageBuilder.storeConfig(true)
		}
		
	}

	// Page Drag/Drop Builder
    $.pageBuilder = {

		toggle: function( ){
			
			var localState = ( localStorage.getItem( 'drag-drop' ) )
			,	theState = (localState == 'true') ? true : false
		
			if( !theState ){
				
				theState = true 
				
				$.pageBuilder.showEditingTools()
				
			} else {
				
				theState = false
			 
				$.pageBuilder.hide()
					
			}
			
			localStorage.setItem( 'drag-drop', theState )
				
		}
		
		, showEditingTools: function() {
			
			// Graphical Flare
			$('[data-action="drag-drop"]').addClass('active')
			
			// Enable CSS
			$('body').addClass('drag-drop-editing')
		
			// JS
			$.pageBuilder.startDroppable()
			
			$.pageBuilder.sectionControls()
			
			$.areaControl.toggle($(this))
			
			$.widthResize.startUp()
			
			
			
		}
		
		, hide: function() {
			
			$('body').removeClass('drag-drop-editing')
		
			$('[data-action="drag-drop"]').removeClass('active')
	
			$('.s-control')
				.off('click.sectionControls')
				
			$.areaControl.toggle($(this))
			
			$.widthResize.shutDown()
			
		}
		
		, handleCloneData: function( cloned ){
			
			var config	= {
					sid: cloned.data('sid')
					, sobj: cloned.data('object')
					, clone: cloned.data('clone')
					, settingData: ($.pl.config.isSpecial) ? $.pl.data.type : $.pl.data.local
				}
			,	clonedSet = ($.pl.config.opts[config.sid] && $.pl.config.opts[config.sid].opts) || {}
			, 	mode = ($.pl.config.isSpecial) ? 'type' : 'local'


			var i = 0
			while ( $( '.section-'+config.sid+'[data-clone="'+i+'"]' ).length != 0) {
			    i++
			}

			cloned
				.attr('data-clone', i)
				.data('clone', i)

			// add clone icon
			cloned.first('.section-controls').find('.title-desc').html(sprintf(" <i class='icon-copy'></i> %s", i))

			console.log(config.clone)
			// set cloned item settings to new clone local settings
			$.each(clonedSet, function(index, opt){
				if( opt.type == 'multi'){
					$.each( opt.opts, function(index2, opt2){

						if( plIsset( $.pl.data.local[opt2.key]) ){
							$.pl.data.local[opt2.key][i] = $.pl.data.local[opt2.key][config.clone]
						}

					})
				} else {

					if( plIsset($.pl.data.local[opt.key]) ){
						$.pl.data.local[opt.key][i] = $.pl.data.local[opt.key][config.clone]
					}

				}
			})

			// save settings data
			$.plAJAX.saveData( 'draft' )
		
		}
		
		, sectionControls: function() {
			
			$('.s-control').on('click.sectionControls', function(e){
		
				e.preventDefault()
			
				var btn = $(this)
				,	section = btn.closest(".pl-sortable")
				,	config	= {
						sid: section.data('sid')
						, sobj: section.data('object')
						, clone: section.data('clone')
						, settingData: ($.pl.config.isSpecial) ? $.pl.data.type : $.pl.data.local
					}
			
				if(btn.hasClass('section-edit')){
					
					// TODO Open up and load options panel
					
					$('body').toolbox({
						action: 'show'
						, panel: 'section-options'
						, info: function(){
						
							$.optPanel.render( config )
						
						}
					})
					
				} else if (btn.hasClass('section-delete')){
					
					var answer = confirm ("Press OK to delete section or Cancel");
					if (answer) {
			            
						section.remove();
			            section.addClass('empty-column')
						store.remove('toolboxShown')
						
					}
					
				} else if (btn.hasClass('section-clone')){
				
					var	cloned = section.clone( true )
					
					cloned
						.insertAfter(section)
						.hide()
						.fadeIn()
						
					$.pageBuilder.handleCloneData( cloned )
					
					
				} else if (btn.hasClass('column-popup')){
					
					// Pop to top level
					
					var answer = confirm ("Press OK to pop (move) section to the top level or cancel.")
					
					if (answer)
						section.appendTo('.pl_main_sortable') //insertBefore('.wpb_main_sortable div.wpb_clear:last');
					
					
				} else if ( btn.hasClass('section-increase')){
					
					var sizes = $.pageBuilder.getColumnSize(section)

					if ( sizes[1] )
						section.removeClass( sizes[0] ).addClass( sizes[1] )

					
				} else if ( btn.hasClass('section-decrease')){

					var sizes = $.pageBuilder.getColumnSize( section )

					if (sizes[2])
						section.removeClass(sizes[0]).addClass(sizes[2]) // Switch for next class


				} else if ( btn.hasClass('section-offset-increase')){
					
					var sizes = $.pageBuilder.getOffsetSize( section )

					if (sizes[1])
						section.removeClass(sizes[0]).addClass(sizes[1])
						

				} else if ( btn.hasClass('section-offset-reduce')){

					var sizes = $.pageBuilder.getOffsetSize( section )

					if (sizes[1])
						section.removeClass(sizes[0]).addClass(sizes[2])
					

				} else if ( btn.hasClass('section-start-row') ){
				
					section.toggleClass('force-start-row')
					
				}
				
				$.pageBuilder.reloadConfig( 'section-control' )
				
			})
		
		}

	
		
        , reloadConfig: function( source ) {
	
			console.log(source)
			
			$('.editor-row').each(function () {
				$.pageBuilder.alignGrid( this )
			})
			
			if( source !== 'start' )
				$.pageBuilder.storeConfig( );
			
        }

		, alignGrid: function( area ) {
		
            var that = this
			,	total_width = 0
            ,	width = 0
            ,	next_width = 0
			,	avail_offset = 0
			, 	sort_area = $(area)
			, 	len = sort_area.children(".pl-sortable").length
			
  			that.isAreaEmpty( sort_area )

            sort_area.children(".pl-sortable:not(.pl-sortable-buffer)").each( function ( index ) {
				
                var section = $(this)
				,	col_size = that.getColumnSize( section )
				,	off_size = that.getOffsetSize( section )
				
				
				if(sort_area.hasClass('pl-sortable-column')){
				
					if(section.hasClass('level1')){
						section
							.removeClass('level1')
							.removeClass(col_size[0])
							.removeClass(off_size[0])
							.addClass('span12 offset0 level2')
							
						col_size = that.getColumnSize( section, true )
						off_size = that.getOffsetSize( section, true )
					} else {
						section
							.addClass('level2')
					}
					
				} else {
					
					section
						.removeClass("level2")
						.addClass("level1")
					
				}
				
				// First/last spacing
				section
					.removeClass("sortable-first sortable-last")
					
				if ( index == 0 )
					section.addClass("sortable-first")
				else if ( index === len - 1 ) 
					section.addClass("sortable-last")
					
				
				// Deal with width and offset
				width = col_size[4] + off_size[3]
				
				total_width += width
				
				avail_offset = 12 - col_size[4];
			
				if( avail_offset == 0 )
					section.addClass('cant-offset')
				else 
					section.removeClass('cant-offset')
			
				if(width > 12){
					avail_offset = 12 - col_size[4]; 
					section.removeClass( off_size[0] ).addClass( 'offset'+avail_offset )
					off_size = $.pageBuilder.getOffsetSize( section )
				}

               	// Set Numbers
				section.find(".section-size:first").html( col_size[3] )
				section.find(".offset-size:first").html( off_size[3] )
				
				if (total_width > 12 || section.hasClass('force-start-row')) {
					
                    section
						.addClass('sortable-first')
                    	.prev('.pl-sortable')
						.addClass("sortable-last")
						
                    total_width = width

                } 

            })

        }
		
		, storeConfig: function( interrupt ) {
			
			var that = this
			, 	interrupt = interrupt || false
			,	map = that.getCurrentMap()
			
			$.pl.map = map
			
			$.plAJAX.ajaxSaveMap( map, interrupt )
			
			return map
			
		
		}
		
		, getCurrentMap: function() {
			
			var that = this
			,	map = {}


			$('.pl-region').each( function(regionIndex, o) {

				var region = $(this).data('region')
				, 	areaConfig = []

				$(this).find('.pl-area').each( function(areaIndex, o2) {

					var area = $(this)
					,	areaContent	= []
					, 	areaSet = {}

					$(this).find('.pl-section.level1').each( function(sectionIndex, o3) {

						var section = $(this)
						
						if( section.data('template') != undefined && section.data('template') != "" ){
			
							set = section.data('template')
							$.merge( areaContent, set )
							
						} else {
							set = that.sectionConfig( section )
							areaContent.push( set )
						
						}

					})

					areaSet = {
							area: ''
						,	content: areaContent
					}

					areaConfig.push( areaSet )

				})

				map[region] = areaConfig

			})
			
			return map
			
		}
		
		, sectionConfig: function( section ){
			
			var that = this
			,	set = {}

			set.object 	= section.data('object')
			set.clone 	= section.data('clone')
		
			set.sid 	= section.data('sid')
			set.span 	= that.getColumnSize( section )[ 4 ]
			set.offset 	= that.getOffsetSize( section )[ 3 ]
			set.newrow 	= (section.hasClass('force-start-row')) ? 'true' : 'false'
			set.content = []
			
			
			// Recursion
			section.find( '.pl-section.level2' ).each( function() {
			
				set.content.push( that.sectionConfig( $(this) ) )
				
			})
			
			return set
			
		}

	
		, isAreaEmpty: function(area){
			var addTo = (area.hasClass('pl-sortable-column')) ? area.parent() : area
			
			if(!area.children(".pl-sortable").not('.ui-sortable-helper').length)
			    addTo.addClass('empty-area')
			else 
			    addTo.removeClass('empty-area')
			
		}

		, getOffsetSize: function( column, defaultValue ) {
			
			var that = this
			,	max = 12
			,	sizes = that.getColumnSize( column )
			,	avail = max - sizes[4]
			,	data = []

			for( i = 0; i <= 12; i++){

					next = ( i == avail ) ? 0 : i+1

					prev = ( i == 0 ) ? avail : i-1	

					if(column.hasClass("offset"+i))
						data = new Array("offset"+i, "offset"+next, "offset"+prev, i)

			}

			if(data.length === 0 || defaultValue)
				return new Array("offset0", "offset0", "offset0", 0)
			else
				return data

		}
		

		, getColumnSize: function(column, defaultValue) {

			if (column.hasClass("span12") || defaultValue) //full-width
				return new Array("span12", "span2", "span10", "1/1", 12)

		    else if (column.hasClass("span10")) //five-sixth
		        return new Array("span10", "span12", "span9", "5/6", 10)

			else if (column.hasClass("span9")) //three-fourth
				return new Array("span9", "span10", "span8", "3/4", 9)

			else if (column.hasClass("span8")) //two-third
				return new Array("span8", "span9", "span6", "2/3", 8)

			else if (column.hasClass("span6")) //one-half
				return new Array("span6", "span8", "span4", "1/2", 6)

			else if (column.hasClass("span4")) // one-third
				return new Array("span4", "span6", "span3", "1/3", 4)

			else if (column.hasClass("span3")) // one-fourth
				return new Array("span3", "span4", "span2", "1/4", 3)

		    else if (column.hasClass("span2")) // one-sixth
		        return new Array("span2", "span3", "span12", "1/6", 2)

			else
				return false

		}

		, startDroppable: function(){
			
			var that = this
			,	sortableArgs = {}
			, 	sortableArgsColumn = {}
			
			sortableArgs = {
			       	items: 	".pl-sortable"
				,	connectWith: ".pl-sortable-area"
				,	placeholder: "pl-placeholder"
				,	forcePlaceholderSize: true
		        ,	tolerance: "pointer"		// basis for calculating where to drop
				,	helper: 	"clone" 		// needed or positioning issues ensue
				,	scrollSensitivity: 50
				,	scrollSpeed: 40
		        ,	cursor: "move"
				,	distance: 3
				,	delay: 100

				, start: function(event, ui){
					$('body')
						.addClass('pl-dragging')
						.toolbox('hide')

					if(ui.item.hasClass('x-item'))
						$.xList.switchOnAdd(ui.item)

					// allows us to change sizes when dragging starts, while keeping good dragging
					$( this ).sortable( "refreshPositions" ) 
					
					// Prevents double nesting columns and other recursion bugs. 
					// Remove all drag and drop elements and disable sortable areas within columns if 
					// the user is dragging a column
					if( ui.item.hasClass('section-plcolumn') ){
				
						$( '.section-plcolumn .pl-sortable-column' ).removeClass('pl-sortable-area ui-sortable')
						$( '.section-plcolumn .pl-section' ).removeClass('pl-sortable')
						
						$( '.ui-sortable' ).sortable( 'refresh' )
						
					}
				

				} 
				, stop: function(event, ui){

					$('body')
						.removeClass('pl-dragging')

					// when new sections are added
					ui.item.find('.banner-refresh').fadeIn('slow')
					
					if( ui.item.hasClass('section-plcolumn') ){
						
						$( '.section-plcolumn .pl-sortable-column' ).addClass('pl-sortable-area ui-sortable')
						$( '.section-plcolumn .pl-section' ).addClass('pl-sortable')
						
						$( '.ui-sortable' ).sortable( 'refresh' )
						
					}
					
					if(ui.item.hasClass('x-item'))
						$.xList.switchOnStop(ui.item)

				}

				, over: function(event, ui) {

		           $( "#droppable" ).droppable( "disable" )

					ui.placeholder.css({
						maxWidth: ui.placeholder.parent().width()
					})

		        }
				, update: function() {
					that.reloadConfig( 'update-sortable' )
				}
			}
			
			$( '.section-plcolumn' ).on('mousedown', function(e){
				$('.section-plcolumn .pl-sortable-area').sortable( "disable" )
				$( '.section-plcolumn .pl-section' ).removeClass('pl-sortable')
			}).on('mouseup', function(e){
				$('.section-plcolumn .pl-sortable-area').sortable( "enable" )
				$( '.section-plcolumn .pl-section' ).addClass('pl-sortable')
			})
			
		    $( '.pl-sortable-area' ).sortable( sortableArgs ) 
		
		//	$( ".x-item" ).draggable()
			
			
		
		}
		
		
    }

	
	$.areaControl = {
	
        toggle: function(btn) {
		
			if(!jQuery.areaControl.isActive){
				
				$('body')
					.addClass('area-controls')
					.find('area-tag')
					.effect('highlight')
			
				btn.addClass('active')
			
				jQuery.areaControl.isActive = true
			
				jQuery.areaControl.listen()
				
			} else {
				btn.removeClass('active')
				jQuery.areaControl.isActive = false
				$('body').removeClass('area-controls')
				
			}
		
		}

		, listen: function() {
			$(".btn-area-down").on("click", function(e) {
				e.stopPropagation()
				$.areaControl.move($(this), 'down')
			});
			$(".btn-area-up").on("click", function(e) {
				e.stopPropagation()
				$.areaControl.move($(this), 'up')
			});
		} 
		
		, update: function() {
			$('.area-tag').each( function(index) {

				var num = index + 1

			    $(this).data('area-number', num).attr('data-area-number', num)

			})
		}
		
		, move: function( button, direction ){


			var iteration = (direction == 'up') ? -1 : 1
			,	currentArea = button.closest('.pl-area')
			,	areaNumber = currentArea.data('area-number')
			, 	moveAreaNumber = areaNumber + iteration
			,	moveArea = $("[data-area-number='"+moveAreaNumber+"']")



			if(moveArea.hasClass('pl-region-bar') && direction == 'up'){

				moveAreaNumber = moveAreaNumber + iteration

				moveArea = $("[data-area-number='"+moveAreaNumber+"']")

				if(direction == 'up'){
					moveArea
						.after( currentArea )
				} else {
					moveArea
						.before( currentArea )
				}

			} else {

				if(direction == 'up'){
					moveArea
						.before( currentArea )
				} else {
					moveArea
						.after( currentArea )
				}

			}

			currentArea.effect('highlight')

			$.areaControl.update()

		}
		
	}
	
	
}(window.jQuery);

