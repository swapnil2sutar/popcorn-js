module( "Popcorn Text Plugin" );

test( "Text", function() {

  var popped = Popcorn( "#video" ),
      expects = 10,
      count = 0,
      setupId,
      textdiv = document.getElementById( "textdiv" ),
      childElem;

  var strings = {
    PLAIN: "This is plain text",
    HTML: "<p>This is <em>HTML</em> text</p>",
    ESCAPED: "&lt;p&gt;This is &lt;em&gt;HTML&lt;/em&gt; text&lt;/p&gt;",
    MULTILINE_NO_BREAKS: "a\nb\r\nc",
    MULTILINE_BREAKS: "a<br>b<br>c"
  };

  expect( expects );

  function plus() {
    if ( ++count===expects ) {
      popped.pause( 0 );
      popped.destroy();
      start();
    }
  }

  function injectString( s ) {
    var elem = document.createElement( "div" );
    elem.innerHTML = s;
    return elem.innerHTML;
  }

  stop();

  ok( "text" in popped, "text is a mehtod of the popped instance" );
  plus();

  equal( textdiv.childElementCount, 0, "initially, there is nothing inside textdiv" );
  plus();

  // Simple text
  popped.text( {
    start: 1,
    end: 3,
    text: strings.PLAIN,
    target: 'textdiv'
  } )
  .cue( 2, function() {
    equal( textdiv.childElementCount, 1, "textdiv now has two inner elements" );
    plus();

    childElem = textdiv.children[ 0 ];
    equal( childElem.innerHTML, strings.PLAIN, "textdiv correctly displaying plain text" );
    plus();
    equal( childElem.style.display, "inline", "textdiv is visible on the page" );
    plus();
  } )
  .cue( 4, function() {
    equal( childElem && childElem.style.display, "none", "textdiv is hidden again" );
    plus();

    popped.pause();
  } )

  // Setup the rest of events (first tests only want 1 text event)
  .on( "pause", function secondarySetup() {
    popped.off( "pause", secondarySetup )

    // HTML text, rendered as HTML
    .text( {
      start: 5,
      end: 7,
      text: strings.HTML,
      target: 'textdiv'
    } )
    .cue( 6, function() {
      equal(
        textdiv.children[ 1 ].innerHTML,
        injectString( strings.HTML ),
        "textdiv correctly displaying HTML text"
      );
      plus();
    } )

    // HTML text, escaped and rendered as plain text
    .text( {
      start: 8,
      end: 10,
      text: strings.HTML,
      escape: true,
      target: 'textdiv'
    } )
    .cue( 9, function() {
      equal(
        textdiv.children[ 2 ].innerHTML,
        injectString( strings.ESCAPED ),
        "textdiv correctly displaying escaped HTML text"
      );
      plus();
    } )

    // Multi-Line HTML text, escaped and rendered as plain text without breaks
    .text( {
      start: 11,
      end: 13,
      text: strings.MULTILINE_NO_BREAKS,
      target: 'textdiv'
    } )
    .cue( 12, function() {
      equal(
        textdiv.children[ 3 ].innerHTML,
        injectString( strings.MULTILINE_NO_BREAKS ),
        "textdiv correctly displaying multiline with no breaks"
      );
      plus();
    } )

    // Multi-Line HTML text, escaped and rendered as plain text with breaks
    .text( {
      start: 14,
      end: 16,
      text: strings.MULTILINE_NO_BREAKS,
      multiline: true,
      target: 'textdiv'
    } )
    .cue( 15, function() {
      equal(
        textdiv.children[ 4 ].innerHTML,
        injectString( strings.MULTILINE_BREAKS ),
        "textdiv correctly displaying multiline with breaks"
      );
      plus();

      // Test is done
      popped.pause();
    } );

    // Continue tests
    popped.play();
  } );

  // Start tests
  popped.play().volume( 0 );

});

asyncTest( "Subtitle", function() {

  var popped = Popcorn( "#video" ),
      popped2 = Popcorn( "#video2" ),
      expects = 11,
      count = 0,
      subTop = 9001,
      subLeft = 9001,
      subtitlediv,
      subtitle2div;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      popped.destroy();
      start();
    }
  }

  popped.text({
      start: 0,
      end: 2,
      text: "this is the first subtitle of 2011"
    })
  .text({
      start: 2,
      end: 4,
      text: "this is the second subtitle of 2011"
    })
  .text({
      start: 5,
      end: 7,
      text: "this is the third subtitle of 2011"
    } )
    .volume( 0 );

  subtitlediv = popped.container;

  popped.text({
    start: 7,
    end: 9,
    text: "instance one test"
  }).play();

  popped2.text({
      start: 7,
      end: 9,
      text: "instance two test"
    })
    .volume( 0 );

  subtitle2div = popped2.container;

  popped.cue( 1, function() {

    popped.on( "pause", function onPause() {
      this.off( "pause", onPause );
      equal( subtitlediv.children[ 0 ].innerHTML, "this is the first subtitle of 2011", "subtitle displaying correct information" );
      plus();

      // capturing location now, to check against later,
      // a subtitle must be displayed to get valid data
      // which is why we do this in cue
      subLeft = subtitlediv.style.left;
      subTop  = subtitlediv.style.top;

      // changing position
      this.media.style.position = "absolute";
      this.media.style.left = "400px";
      this.media.style.top = "600px";
      this.media.play();
    });
    popped.media.pause();

  });

  popped.cue( 3, function() {

    this.on( "pause", function onPause() {
      this.off( "pause", onPause );
      // check position of subtitle that should have moved with video,
      // a subtitle must be displayed to get valid data
      ok( subtitlediv.style.left !== subLeft, "subtitle's left position has changed" );
      plus();
      ok( subtitlediv.style.top !== subTop, "subtitle's top position has changed" );
      plus();

      // we know values have changed, but how accurate are they?
      // check values against the video's values
      // we need four checks because if we just check against video's position,
      // and video's position hasn't updated either, we'll pass when we should fail
      equal( subtitlediv.style.left, this.position().left + "px", "subtitle left position moved" );
      plus();
      ok( Popcorn.position( subtitlediv ).top > this.position().top, "subtitle top position moved" );
      plus();

      equal( subtitlediv.children[ 1 ].innerHTML, "this is the second subtitle of 2011", "subtitle displaying correct information" );
      plus();

      this.media.play();
    });
    this.media.pause();
  });

  popped.cue( 4, function() {

    this.on( "pause", function onPause() {
      this.off( "pause", onPause );
      equal( subtitlediv.children[ 1 ].style.display, "none", "subtitle is hidden" );
      plus();

      this.media.play();
    });
    this.media.pause();
  });

  popped.cue( 8, function() {

    this.on( "pause", function onPause() {
      this.off( "pause", onPause );
      popped2.currentTime( 8 ).play();
    });
    this.pause();
  });

  popped2.cue( 8, function() {

    this.on( "pause", function onPause() {
      this.off( "pause", onPause );
      equal( subtitlediv.children[ 3 ].innerHTML, "instance one test", "subtitle displaying correct information" );
      plus();
      equal( subtitle2div.children[ 0 ].innerHTML, "instance two test", "subtitle displaying correct information" );
      plus();
      popped.media.play();
    });
    this.pause()
  });

  popped.cue( 10, function() {
    ok( subtitlediv.children[ 0 ].style.display === "none" &&
        subtitlediv.children[ 1 ].style.display === "none" &&
        subtitlediv.children[ 2 ].style.display === "none", "All subtitles are no longer visible" );
    plus();

    this.on( "pause", function onPause() {
      this.off( "pause", onPause );
      this.removeTrackEvent( this.data.trackEvents.byStart[ 6 ]._id );

      // There were 4 subtitles, should be three now
      ok( subtitlediv.children.length === 3 , "subtitle div was destroyed"  );
      plus();
    });

    this.pause();
  });
});

asyncTest( "Subtitle data tests", function() {

  var popped = Popcorn( "#video" ),
      expects = 1,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      popped.destroy();
      start();
    }
  }

  popped.text({
    start: 0,
    end: 10
  });

  equal( popped.container.children[ 0 ].innerHTML, "", "text with no `text` attribute defaults to an empty string" );
  plus();
});

asyncTest( "Subtitle container creation tests", function() {

  var popped = Popcorn( "#video" ),
      expects = 3,
      containerAtLoad = document.getElementById( "divThatDoesntExist" ),
      containerAfterParse,
      count = 0;

  expect( expects );

  function plus() {
    if ( ++count === expects ) {
      popped.pause().destroy();
      start();
    }
  }

  popped.text({
    start: 0,
    end: 10,
    text: "My Text",
    target: "divThatDoesntExist"
  });

  containerAfterParse = document.getElementById( "divThatDoesntExist" );

  equal( !!containerAtLoad, false, "Container doesn't exist initially" );
  plus();
  equal( !!containerAfterParse, true, "Container exists now" );
  plus();
  equal( containerAfterParse.children[ 0 ].innerHTML, "My Text", "Subtitle text displayed in created container" );
  plus();

});
