'use client';

// Function to find a text node containing a specific offset
function findNodeAtOffset(root: Node, offset: number): { node: Node, offset: number } | null {
  let currentNode = root;
  let currentOffset = 0;

  // Walk through all nodes in the tree
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const nodeLength = node.textContent?.length || 0;
    
    // Check if the offset is within this node
    if (currentOffset <= offset && offset < currentOffset + nodeLength) {
      return { node, offset: offset - currentOffset };
    }
    
    // Move to the next node
    currentOffset += nodeLength;
    node = walker.nextNode();
  }

  return null;
}

// Function to create a range from start and end offsets
export function createRangeFromOffsets(container: Node, start: number, end: number): Range | null {
  const startInfo = findNodeAtOffset(container, start);
  const endInfo = findNodeAtOffset(container, end);

  if (!startInfo || !endInfo) return null;

  const range = document.createRange();
  range.setStart(startInfo.node, startInfo.offset);
  range.setEnd(endInfo.node, endInfo.offset);

  return range;
}

// Function to find the DOM position of a text fragment based on offsets
export function findPositionByOffset(
  container: HTMLElement, 
  text: string, 
  position: { startOffset: number, endOffset: number }
): { top: number, left: number, width: number } | null {
  try {
    // Create a range from the offsets
    const range = createRangeFromOffsets(container, position.startOffset, position.endOffset);
    if (!range) return null;

    // Get the bounding client rect of the range
    const rect = range.getBoundingClientRect();
    
    // Adjust for scroll position
    const containerRect = container.getBoundingClientRect();

    return {
      top: rect.top - containerRect.top + container.scrollTop,
      left: rect.left - containerRect.left + container.scrollLeft,
      width: rect.width
    };
  } catch (error) {
    console.error('Error finding position by offset:', error);
    return null;
  }
}

// Function to get the offsets of a selection within a container
export function getOffsetsFromSelection(container: Node, selection: Selection): { startOffset: number, endOffset: number } | null {
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  
  // Get the text content of the container
  const containerText = container.textContent || '';

  // Initialize counters
  let startOffset = 0;
  let endOffset = 0;

  // Walk through all text nodes to find the offset
  const startResult = getOffsetInContainer(container, range.startContainer, range.startOffset);
  const endResult = getOffsetInContainer(container, range.endContainer, range.endOffset);

  if (startResult === null || endResult === null) return null;

  return {
    startOffset: startResult,
    endOffset: endResult
  };
}

// Helper function to get the offset of a node within a container
function getOffsetInContainer(container: Node, targetNode: Node, nodeOffset: number): number | null {
  let offset = 0;
  
  // Use TreeWalker to iterate through text nodes
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let currentNode = walker.nextNode();

  while (currentNode) {
    if (currentNode === targetNode) {
      return offset + nodeOffset;
    }
    
    offset += currentNode.textContent?.length || 0;
    currentNode = walker.nextNode();
  }

  return null;
}
