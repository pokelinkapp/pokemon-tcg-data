const {
  readdirSync,
  createWriteStream,
  existsSync
} = require( 'fs' )
var http = require( 'https' )

const getFiles = path =>
  readdirSync( path )

const setFiles = getFiles( './cards/en/' ).map( filename => `./cards/en/${filename}` )

// const downloadCards =


var downloadFile = function ( url, dest, cb ) {
  if ( existsSync( dest ) ) {
    return null;
  }

  var file = createWriteStream( dest );
  var request = http.get( url, function ( response ) {
    if ( response.statusCode === 301 ) {
      console.log( `${url} - ${response.statusCode}` )
      cb()
    }
    response.pipe( file );
    file.on( 'finish', function () {
      file.close( cb ); // close() is async, call cb after close completes.
    } );
  } ).on( 'error', function ( err ) { // Handle errors
    fs.unlink( dest ); // Delete the file async. (But we don't check the result)
    if ( cb ) cb( err.message );
  } );
};

let setCode = 1
const downloadCardsFromSet = ( filepath ) => {
  let cards = require( filepath )

  cards.forEach( card => {
    try {
      let cardId = card.id
        .replace( ' ', '_' )
        .replace( '<', '_' )
        .replace( '>', '_' )
        .replace( '|', '_' )
        .replace( '*', '_' )
        .replace( '/', '_' )
        .replace( '?', '_' );

      downloadFile( card.images.large, `./sprites/cards/large/${cardId}.png` )
      downloadFile( card.images.small, `./sprites/cards/small/${cardId}.png` )
    } catch ( e ) {
      console.error( `Error writing ${e.message}, suck my dick` )
      return false;
    }
  })

  if ( setCode < setFiles.length ) {
    setCode += 1
    setTimeout( () => {
      downloadCardsFromSet( setFiles[ setCode ] )
    }, 10000 )
  }
}

downloadCardsFromSet( setFiles[ setCode ] )