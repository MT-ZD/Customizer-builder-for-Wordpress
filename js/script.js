// Predefine variables
let sectionAmmount = 0,
    prehtml = '',
    currentlyEdited,
    hasTinyMCE = false
    activeSection = null;


// Check if data is stored in local storage
if ( localStorage.getItem( 'storedCustomizer' ) == null ) {

    // Predefine empty mainObject
    mainObject = {};

} else {

    // Parse and set mainObject
    mainObject = JSON.parse( localStorage.getItem( 'storedCustomizer' ) );

    // Loop through objects and create HMTL from stored data
    Object.keys( mainObject ).forEach( function( key ) {

        sectionAmmount++;

        // Add section
        prehtml += `
        <div class="position" id="${ key }">
            <div class="label">
                <div class="name">${ mainObject[ key ].name }</div>
                <div class="actions">
                    <img src="img/arrow.svg" class="up" alt="">
                    <img src="img/arrow.svg" class="down" alt="">
                    <img src="img/trash.svg" class="trash" alt="">
                    <img src="img/settings.svg" class="edit" alt="">
                </div>
            </div>
            <div class="settings">`;

        // Loop through settings and add them
        mainObject[key].settings.forEach( element => {

            prehtml += `
            <div class="setting" codename="${ element.codename }">
                <div class="icon">
                    <img src="img/icons/${ element.type }.svg" alt="">
                </div>
                <div class="name">${ element.name }</div>
                <div class="action">
                    <img src="img/arrow.svg" class="up" alt="">
                    <img src="img/arrow.svg" class="down" alt="">
                    <img src="img/trash.svg" class="trash" alt="">
                </div>
            </div>
            `;

        });

        // Add 'Add Nwe Setting' button and close div
        prehtml += `
                <div class="addNewSetting">
                    <img src="img/add.svg" alt="">
                    Add New Setting
                </div>
            </div>
        </div>
        `;
    });

    // Insert generated HTML before 'Add New Section' button
    $( prehtml ).insertBefore( $( '.addNewSection' ) );
}


// Check if text domain is stored in local storage
if ( localStorage.getItem( 'storedTextDomain' ) == null ) {

    // Load text domain from document and add it to local storae
    textDomain = $( '#textDomain' ).text();
    localStorage.setItem( 'storedTextDomain', $( '#textDomain' ).text() );

} else {

    // Load text domain from local storage
    $('#textDomain').text( localStorage.getItem( 'storedTextDomain' ) );
    textDomain = $( '#textDomain' ).text();

}


// Save data on page reload
window.onbeforeunload = function ( evt ) {

    //let k = "Refresh might damage you progress. Continue?";
    if ( evt ) {

        localStorage.setItem( 'storedCustomizer', JSON.stringify( mainObject ) );
        localStorage.setItem( 'storedTextDomain', textDomain );
        //evt.returnValue = k;

    }
}


// Update text domain on change
$( '#textDomain' ).on( 'input', function() {

    textDomain = this.innerHTML;
    updatePreview( activeSection );

})


// Expand section
$( 'body' ).on( 'click', '.position .label', function(e) {

    // Expand only if clicked on label
    if(e.target == this) {

        // Toggle 'expanded' class
        $( this ).closest( '.position' ).toggleClass( 'expanded' );
    
        // Create filename from section name
        const fileName = $( this ).closest( '.position' ).find( '.label .name' ).text().toLowerCase().replace(/ /g,"_");
    
        // Change displayed filename
        $( '.fileName span' ).text( fileName );

        // Change active section
        activeSection = $( this ).closest( '.position' ).attr( 'id' );
    
        // Update code preview
        updatePreview( $( this ).closest( '.position' ).attr( 'id' ) );
    }

});


// Change preview when clicking on settings
$( 'body' ).on( 'click', '.setting', function() {

    updatePreview( $( this ).closest( '.position' ).attr( 'id' ) );

});


// Define move up and down functions - by https://stackoverflow.com/users/247893/h2ooooooo
$.fn.moveUp = function() {
    $.each( this, function() {
        $( this ).after( $( this ).prev() );
    });
};
$.fn.moveDown = function() {
    $.each( this, function() {
        $( this ).before( $( this ).next() );   
    });
};


// Move section up
$( 'body' ).on( 'click', '.position .label .up', function() {

    // Move section up in DOM
    $( this ).closest( '.position' ).moveUp();

    // Change section's position attributes in mainObject
    Object.keys( mainObject ).forEach( key => {
        mainObject[ key ].position = $( '#' + key ).index() + 1;
    });

    // Sort sections in mainObject
    sortSections();

});


// Move section down
$( 'body' ).on( 'click', '.position .label .down', function() {

    // Move section down in DOM
    $( this ).closest( '.position' ).moveDown();

    // Change section's position attributes in mainObject
    Object.keys( mainObject ).forEach( key => {
        mainObject[ key ].position = $( '#' + key ).index() + 1;
    });

    // Sort sections in mainObject
    sortSections();

});


// Move setting up
$( 'body' ).on( 'click', '.setting .up', function() {

    // Get section ID
    const id = $( this ).closest( '.position' ).attr( 'id' );

    // Move setting up in DOM
    $( this ).closest( '.setting' ).moveUp();
    
    // Reorder all settings in section
    reorderSettings( id );

});


// Move setting down
$( 'body' ).on( 'click', '.setting .down', function() {

    // Get section ID
    const id = $( this ).closest( '.position' ).attr( 'id' );
    
    // Move setting up in DOM
    $( this ).closest( '.setting' ).moveDown();

    // Reorder all settings in section
    reorderSettings( id );

});


// Add new section
$( '.addNewSection' ).on( 'click', function() {

    // Remove 'expanded' class from all positions
    $( '.position' ).removeClass( 'expanded' );

    // Increse section ammount
    sectionAmmount++;

    // Create scetion HTML
    const emptySection = `
    <div class="position expanded" id="section_${ sectionAmmount }">
        <div class="label">
            <div class="name" contenteditable>Section ${ sectionAmmount }</div>
            <div class="actions">
                <img src="img/arrow.svg" class="up" alt="">
                <img src="img/arrow.svg" class="down" alt="">
                <img src="img/trash.svg" class="trash" alt="">
                <img src="img/settings.svg" class="edit" alt="">
            </div>
        </div>
        <div class="settings">
            <div class="addNewSetting">
                <img src="img/add.svg" alt="">
                    Add New Setting
            </div>
        </div>
    </div>`;

    // Insert section before 'Add New Section' button
    $( emptySection ).insertBefore( this );

    // Change displayed filename
    $( '.fileName span' ).text( 'section_' + sectionAmmount );

    // Add section to main object
    mainObject[ "section_" + sectionAmmount ] = {
        name: "Section " + sectionAmmount,
        position: sectionAmmount,
        codename: 'seciton_' + sectionAmmount,
        settings: []
    };

});


// Remove section
$( 'body' ).on( 'click', '.position .actions .trash', function() {

    // Get section ID
    const id = $( this ).closest( '.position' ).attr( 'id' );

    // Ask user if they want to remove section
    let c = confirm( 'Do you really want to remove this section?' );

    if ( c == true ) {
        $( this ).closest( '.position' ).remove();
        delete mainObject[ id ];
    }

    // Clear PHP preview
    $( 'code' ).html('');

});

// Show section editor
$( 'body' ).on( 'click', '.position .actions .edit', function() {

    // Get section ID
    const id = $( this ).closest( '.position' ).attr( 'id' );

    // Display editor and add section id
    $( '.popup' ).toggleClass( 'visible' );
    $( '.popup' ).attr( 'section', id );


    // Fill data
    $('.popup #s_name').val( mainObject[id].name );
    $('.popup #s_codename').val( mainObject[id].codename );
});


// Close editor
$( '.popup button' ).on( 'click', function() {
    $( '.popup' ).toggleClass( 'visible' );
});


// Edit section
$( '#s_name, #s_codename' ).on( 'input', function() {
    
    // Get section ID
    const id = $( '.popup' ).attr( 'section' );

    if ( $(this).attr('id') == "s_name" ) {

        mainObject[ id ].name = $(this).val();
        $( '#' + id + ' .label .name' ).text( $(this).val() );

    } else if ( $(this).attr( 'id' ) == "s_codename" ) {
        mainObject[ id ].codename = $(this).val();
        
        // Change filename if section is active
        if ( id == activeSection ) {

            // Change filename to codename
            $( '.fileName span' ).text( $(this).val() );
    
            // Update PHP preview
            updatePreview( id );
    
        }
    }
});


// Add new setting
$( 'body' ).on( 'click', '.addNewSetting', function() {

    const id = $( this ).closest( '.position' ).attr( 'id' );
    const num = $( this ).closest( '.position' ).find( '.setting' ).length + 1;

    const settingHTML = `
    <div class="setting" codename="setting_${ num }">
        <div class="icon">
            <img src="img/icons/text.svg" alt="">
        </div>
        <div class="name" contenteditable>Setting ${ num }</div>
        <div class="action">
            <img src="img/arrow.svg" class="up" alt="">
            <img src="img/arrow.svg" class="down" alt="">
            <img src="img/trash.svg" class="trash" alt="">
        </div>
    </div>
    `;

    // Insert empty setting before 'Add New Setting' button
    $( settingHTML ).insertBefore( this );

    // Add setting to mainObject
    mainObject[ id ].settings.push( { 
        name: 'Setting ' + num,
        type: 'text',
        default: 'Change me',
        transport: 'refresh',
        codename: 'setting_' + num,
        description: 'Custom description',
        sanitize: '',
        choices: {} 
    } );

    // Update PHP preview
    updatePreview( id );

    // Change currently edited setting
    currentlyEdited = mainObject[ id ].settings[ mainObject[ id ].settings.length - 1 ];

    // Update editor
    $( '.frame #name' ).val( currentlyEdited.name );
    $( '.frame #type' ).val( currentlyEdited.type );
    $( '.frame #type' ).trigger( 'inputcustom' );
    $( '.frame #default' ).val( currentlyEdited.default );
    $( '.frame #description' ).val( currentlyEdited.description );
    $( '.frame #transport' ).val( currentlyEdited.transport );
    $( '.frame' ).attr( 'section-id', id );

});


// Remove setting
$( 'body' ).on( 'click', '.setting .action .trash', function() {

    const id = $( this ).closest( '.position' ).attr( 'id' );
    const setting = $( this ).closest( '.setting' )[0];
    const index = $( setting ).index();

    // Ask user if they want to remove setting
    let c = confirm( 'Do you really want to remove this setting?' );

    if ( c == true ) {
        $( this ).closest( '.setting' ).remove();
        mainObject[id].settings.splice( index, 1 );
    }

    // Update PHP preview
    updatePreview( id );

});


// Load setting to editor
$( 'body' ).on( 'click', '.setting', function() {

    const id = $( this ).closest( '.position' ).attr( 'id' );
    const setting = $( this ).closest( '.setting' )[ 0 ];
    const index = $( setting ).index();

    // Change currently edited setting
    currentlyEdited = mainObject[ id ].settings[ index ];

    // Update editor
    $( '.frame' ).attr( 'section-id', id );
    $( '.frame #name' ).val( currentlyEdited.name );
    $( '.frame #codename' ).val( currentlyEdited.codename );
    $( '.frame #type' ).val( currentlyEdited.type );
    $( '.frame #type' ).trigger( 'inputcustom' );
    $( '.frame #default' ).val( currentlyEdited.default );
    $( '.frame #description' ).val( currentlyEdited.description );
    $( '.frame #transport' ).val( currentlyEdited.transport );
    $( '.frame #sanitize' ).val( currentlyEdited.sanitize );

    // Add choices
    let choicesHTML = "";

    Object.keys( currentlyEdited.choices ).forEach( key => {

        choicesHTML += `
        <div class="choice">
            <input type="text" class="value" placeholder="Value" value="${ key }">
            <input type="text" class="label" placeholder="Label" value="${ currentlyEdited.choices[ key ] }">
            <img src="img/trash.svg" alt="">
        </div>`;

    });

    $( choicesHTML ).insertBefore( $( '.frame .choices button' ) );

});


// Change inputs to match settings
$( 'body' ).on( 'input inputcustom', '.frame #type', function() {

    // Show "Choices" tab if type requires it
    if ( ['radio', 'select'].includes( $( this ).val() ) ) {
        $( '.choices' ).show();
    } else {
        $( '.choices' ).hide();
    }

    // Change 'DEFAULT' field to color if needed
    if ( $( this ).val() == 'color' ) {
        $( 'input[type="color"]' ).show();
        $( '#default' ).hide();
    } else {
        $( 'input[type="color"]' ).hide();
        $( '#default' ).show();
    }

});


// Update setting
$( 'body' ).on( 'input', '.frame input, .frame select, .frame textarea', function() {

    const type = $( this ).attr( 'id' );
    const parent = $( this ).parent();

    if ( type == 'name' ) {

        const sectionID = $( '.frame' ).attr( 'section-id' );
        const index = $( '#' + sectionID ).find( '.setting[codename="' + currentlyEdited.codename + '"]' ).index();

        // Change all setting name occurrences
        rename( sectionID, index, $( this ).val() ) ;

    } else if ( type == 'codename' ) {

        const sectionID = $( '.frame' ).attr( 'section-id' );
        const index = $( '#' + sectionID ).find( '.setting[codename="' + currentlyEdited.codename + '"]' ).index();

        // Change all setting codename occurrences
        changeCodename( sectionID, index, $( this ).val() );

    } else if ( type == 'type' ) {

        const sectionID = $( '.frame' ).attr( 'section-id' );
        
        // Change setting icon
        $( '#' + sectionID ).find( '.setting[codename="' + currentlyEdited.codename + '"]' ).find( '.icon img' ).attr( 'src', 'img/icons/' + $( this ).val() + '.svg' );

        // Change setting type in mainObject
        currentlyEdited[ type ] = $( this ).val();

    } else if ( parent.hasClass( 'choice' ) ) {
        choicesObj = {}

        // Loop through choices and update them in mainObject
        $( '.choice' ).each( ( i, element ) => {

            let value = $( element ).find( '.value' ).val();
            let label = $( element ).find( '.label' ).val();
            choicesObj[ value ] = label;

        });

        currentlyEdited.choices = choicesObj;

    } else {
        // Change all other setting elements
        currentlyEdited[ type ] = $( this ).val();
    }

    // Update PHP preview
    updatePreview( $( '.frame' ).attr( 'section-id' ) );

});


// Add new choice
$( '.choices button' ).on( 'click', function() {

    // Prevent form submition
    event.preventDefault();

    const choiceHTML = `
    <div class="choice">
        <input type="text" class="value" placeholder="Value">
        <input type="text" class="label" placeholder="Label">
        <img src="img/trash.svg" alt="">
    </div>`;

    // Insert new choice
    $( choiceHTML ).insertBefore( $( this ) );

});


// Remove choice
$( 'body' ).on( 'click', '.choice img', function() {
    $( this ).parent().remove();
});


// Generates PHP
function generatePHP( sectionKey ) {

    // New section code
    let php = `// Add main section\n$wp_customize->add_section( '${ textDomain }_${ mainObject[ sectionKey ].codename }' , array(\n    'title'      => __( '${ mainObject[ sectionKey ].name }', '${ textDomain }' ),\n    'priority'   => ${ mainObject[ sectionKey ].position }0,\n));\n\n// -- Add settings --\n\n`;

    // Loop through all settings and add their code
    mainObject[sectionKey].settings.forEach( element => {

        // Define setting
        php += `// Add "${ element.name }"\n$wp_customize->add_setting( '${ sectionKey }_${ element.codename }' , array(`;

        // Add default value if not empty
        if(element.default) php += `\n    'default' => '${ element.default }',`;

        // Add sanitize callback if not empty
        if(element.sanitize) php += `\n    'sanitize_callback' => '${ element.sanitize }',`;

        // Add transport type
        php += `\n    'transport' => '${ element.transport }',`;

        // Close setting
        php += '\n) );\n\n';

    });

    // Separate controllers section
    php += `\n// ---\n\n\n// --- Add controllers ---\n`;

    // Loop through all settings and add their controllers
    mainObject[ sectionKey ].settings.forEach( element => {

        // Insert setting name
        php += `\n// Add "${ element.name }"`;

        // Predefine additional check
        let objectController = true;

        if ( element.type == "image" ) {

            // Add image controller
            php += `\n$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, '${ sectionKey }_${ element.codename }' , array(`;

        } else if ( element.type == "file" ) {

            // Add file controller
            php += `\n$wp_customize->add_control( new WP_Customize_Upload_Control( $wp_customize, '${ sectionKey }_${ element.codename }' , array(`;

        } else if ( element.type == "color" ) {

            // Add color controller
            php += `\n$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, '${ sectionKey }_${ element.codename }' , array(`;

        } else if ( element.type == "tinymce" ) {

            // Add TinyMCE controller
            php += `\n$wp_customize->add_control( new Text_Editor_Custom_Control( $wp_customize, '${ sectionKey }_${ element.codename }' , array(`;

            hasTinyMCE = true;

        } else {

            // Add all other controllers
            php += `\n$wp_customize->add_control( '${ sectionKey }_${ element.codename }' , array(`;

            objectController = false;
        }

        // TinyMCE needs the type to be textarea
        type = element.type == 'tinymce' ? 'textarea' : element.type;

        // Add label, section codename and setting codename
        php += `\n    'label' => __( '${ element.name }', '${ textDomain }' ),`;
        php += `\n    'section' => '${ textDomain }_${ mainObject[ sectionKey ].codename }',`;
        php += `\n    'settings' => '${ sectionKey }_${ element.codename }',`;

        // Add description if not emty
        if( element.description ) php += `\n    'description' => __('${ element.description }', '${ textDomain }'),`;

        // Object controllers don't need type to be defined except TinyMCE
        if( !objectController || element.type == 'tinymce' ) php += `\n    'type' => '${ type }',`;

        // Loop throudg all the choices and add them
        if( element.choices && Object.keys( element.choices ).length > 0 ) {

            php += `\n    'choices' => array(`;

            Object.keys( element.choices ).forEach( key => {
                php += `\n        '${ key }' => '${ element.choices[ key ] }',`;
            });

            php += `\n    ),`;

        }

        // Object controllers need one more bracket
        if ( objectController ) {
            php += `\n) ) );\n`;
        } else {
            php += `\n) );\n`;
        }

    });

    php += `\n// ---`;

    return php;

}


// Updates PHP preview
function updatePreview( sectionKey ) {
    $( 'code' ).html( generatePHP( sectionKey ) );
}


// Clear progress
$( '.refresh img' ).on( 'click', () => {
    let c = confirm( 'This will destroy all of your progress. Continue?' );
    if ( c ) clear();
});


// Clears local storage
function clear() {
    localStorage.clear();
    delete mainObject;
    window.location = 'index.html';
}


// Renames section
function rename( section, setting, name ) {

    const sectionNode = $( '.position#' + section );
    const originalCodename = mainObject[ section ].settings[ setting ].codename;

    // Don't allow empty names
    if( !name ) name = "_";

    // Change name in DOM
    sectionNode.find( '[codename="' + originalCodename + '"] .name' ).text( name );

    // Change name in mainObject
    mainObject[ section ].settings[ setting ].name = name;

    // Update name in editor
    if( currentlyEdited == mainObject[ section ].settings[ setting ] ) {
        $( '.frame #name' ).val( name );
    }

}

// Changes setting codename
function changeCodename( section, setting, codename ) {
    
    const sectionNode = $( '.position#' + section );
    const originalCodename = mainObject[ section ].settings[ setting ].codename;
    
    let ammount = sectionNode.find( '[codename="' + codename + '"]' ).length;

    // Check if setting name is unique within section
    if ( ammount != 0 ) {
        let n = 0;

        // Loop through names until one is available
        while( ammount != 0 ) {
            ammount = sectionNode.find( '[codename="' + codename + '_' + n + '"]' ).length;
            n++;
        }

        codename = codename + '_' + n
    }

    // Remove &nbsp; because it breaks codename system
    codename = codename.replace( '&nbsp;', '_' );


    // Don't allow empty names
    if( !codename ) codename = "_";

    
    // Change codename in DOM
    sectionNode.find( '[codename="' + originalCodename + '"]' ).attr( 'codename', codename );

    // Change codename in mainObject
    mainObject[ section ].settings[ setting ].codename = codename;

    
    // Update codename in editor
    if( currentlyEdited == mainObject[ section ].settings[ setting ] ) {
        $( '.frame #codename' ).val( codename );
    }

}


// Creates downloadable zip
function package() {
    let zip = new JSZip();
    let customizer = zip.folder( 'customizer' );

    hasTinyMCE = false;

    // Add all sections to zip as separete files
    Object.keys( mainObject ).forEach( key => {
        customizer.file( mainObject[ key ].codename + '.php', '<?php\n\n' + generatePHP( key ) );
    });

    let functionsFile = "",
        snippets = "";

    if ( hasTinyMCE ) {

        // Functions file with TinyMCE imported
        functionsFile += `<?php\n\n// Add customizer\nfunction ${ textDomain }_customize_register( $wp_customize ) {\n\n    // TinyMCE in customizer\n    class Text_Editor_Custom_Control extends WP_Customize_Control\n        {\n        public $type = 'textarea';\n        public function render_content() { ?>\n            <label>\n            <span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>\n            <?php\n                $settings = array(\n                'media_buttons' => false,\n                'quicktags' => false\n                );\n                $this->filter_editor_setting_link();\n                wp_editor($this->value(), $this->id, $settings );\n            ?>\n            </label>\n        <?php\n            do_action('admin_footer');\n            do_action('admin_print_footer_scripts');\n        }\n        private function filter_editor_setting_link() {\n            add_filter( 'the_editor', function( $output ) { return preg_replace( '/<textarea/', '<textarea ' .$this->get_link(), $output, 1 ); } );\n        }\n    }\n    function editor_customizer_script() {\n        wp_enqueue_script( 'wp-editor-customizer', get_template_directory_uri() . '/js/customizer-panel.js', array('jquery' ), rand(), true );\n    }\n    add_action( 'customize_controls_enqueue_scripts', 'editor_customizer_script' );\n`;

        // TinyMCE js file
        const customizerPanel = `( function( $ ) {\n    wp.customizerCtrlEditor = {\n        init: function() {\n            $( window ).load( function(){\n                $( 'textarea.wp-editor-area' ).each( function(){\n                    var tArea = $( this ),\n                        id = tArea.attr( 'id' ),\n                        editor = tinyMCE.get( id ),\n                        setChange,\n                        content;\n                    if( editor ){\n                        editor.onChange.add( function ( ed, e ) {\n                            ed.save();\n                            content = editor.getContent();\n                            clearTimeout( setChange );\n                            setChange = setTimeout( function(){\n                                tArea.val( content ).trigger( 'change' );\n                            },500);\n                        });\n                    }\n                    tArea.css({\n                        visibility: 'visible'\n                    }).on( 'keyup', function(){\n                        content = tArea.val();\n                        clearTimeout( setChange );\n                        setChange = setTimeout( function(){\n                            content.trigger( 'change' );\n                        },500);\n                    });\n                });\n            });\n        }\n    };\n    wp.customizerCtrlEditor.init();\n} )( jQuery );\n`;

        // Add TinyMCE file to zip
        zip.folder( 'js' ).file( 'customizer-panel.js', customizerPanel );

    } else {

        // Default functions file
        functionsFile += `<?php\n\n// Add customizer\nfunction ${ textDomain }_customize_register( $wp_customize ) {`;

    }

    // Import all section files and add snippets to snippet file
    Object.keys( mainObject ).forEach( key => {
        functionsFile += `\n    require_once '${ mainObject[ key ].codename }.php';`;

        // Loop through all settings and add them to snippet file
        mainObject[ key ].settings.forEach( setting => {
            let defaultVal = "";

            if ( setting.default ) defaultVal = ', "' + setting.default + '"';
            snippets += `<?php echo get_theme_mod('${ key }_${ setting.codename }'${ defaultVal }); ?>\n`;
        });
    });

    // Register hook
    functionsFile += `\n}\nadd_action( 'customize_register', '${ textDomain }_customize_register' );`;

    // Add functions file and snippets file to zip
    zip.file( 'functions.php', functionsFile );
    zip.file( 'snippets.php', snippets );

    // Generate zip and download it
    zip.generateAsync( { type: 'blob' } )
        .then( function( content ) {
            saveAs( content, textDomain + '.zip' );
        }
    );
}

// ! <?php echo get_theme_mod('button_email'); ?>

// Export PHP
$( '.export' ).on( 'click', () => {
    package();
});


// Sorts sections within mainObject
function sortSections() {
    let objects = [];
    let keys = []

    Object.keys( mainObject ).forEach( key => {
        objects[ mainObject[key].position - 1 ] = mainObject[ key ];
        keys[ mainObject[ key ].position - 1 ] = key;
    });

    mainObject = {};

    for ( let i = 0; i < keys.length; i++ ) {
        mainObject[ keys[ i ] ] = {};
        mainObject[ keys[ i ] ] = objects[ i ];
    }
}


// Reorders settings within mainObject
function reorderSettings( section ) {
    const domSettings = $( '#' + section ).find( '.setting' );
    const mainOrder = [];
    const newOrder = [];

    for ( let i = 0; i < mainObject[ section ].settings.length; i++ ) {
        mainOrder[ mainObject[ section ].settings[ i ].codename ] = i;
    }

    for ( let i = 0; i < domSettings.length; i++ ) {
        const element = domSettings[ i ];
        newOrder[ i ] = mainObject[ section ].settings[ mainOrder[ $( element ).attr( 'codename' ) ] ];
    }

    mainObject[ section ].settings = newOrder;
}