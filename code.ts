// Show the UI defined in ui.html with a set size.
figma.showUI(__html__, { width: 712, height: 396, themeColors: true});

// Listen for messages from the UI.
figma.ui.onmessage = async (msg) => {
  console.log('Received message:', msg);
  try {
    if (msg.type === 'generate-qr') {
      // Create a frame for the QR code
      const frame = figma.createFrame();
      frame.name = "QR Code";
      frame.resize(520, 520);
      
      // Set white background for frame
      frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

      // Create an SVG node from the generated QR Code
      const svgNode = await figma.createNodeFromSvg(msg.svgString);
      
      // Make sure all the paths in the SVG are black
      const traverse = (node: any) => {
        if (node.fills) {
          // Only make black if it's not white (for background)
          const isWhite = node.fills.some((fill: any) => 
            fill.type === 'SOLID' && 
            fill.color.r === 1 && 
            fill.color.g === 1 && 
            fill.color.b === 1
          );
          
          if (!isWhite) {
            node.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
          }
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(svgNode);

      // Resize the SVG to fit the frame
      svgNode.resize(520, 520);
      
      // Center the SVG in the frame
      frame.appendChild(svgNode);
      svgNode.x = 0;
      svgNode.y = 0;

      // Add the frame to the current page
      figma.currentPage.appendChild(frame);

      // Center the frame in the viewport
      const centerX = figma.viewport.center.x - frame.width / 2;
      const centerY = figma.viewport.center.y - frame.height / 2;
      frame.x = centerX;
      frame.y = centerY;

      // Select the frame
      figma.currentPage.selection = [frame];
      
      // Zoom to fit the frame
      figma.viewport.scrollAndZoomIntoView([frame]);

      // Inform the UI that the QR Code was generated successfully
      figma.ui.postMessage({ type: 'success' });
    }
  } catch (error) {
    console.error('Error during QR code generation:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }
    figma.ui.postMessage({ type: 'error', message: errorMessage });
  }
}; 