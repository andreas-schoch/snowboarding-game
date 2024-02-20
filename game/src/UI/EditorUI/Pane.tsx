import {ParentComponent, onCleanup, onMount, Show} from 'solid-js';

const noop = () => {};
export type ResizeProps = {colStart: number, colEnd: number, rowStart: number, rowEnd: number};
export type PaneProps = {title: string, class?: string} & ResizeProps;

export const Pane: ParentComponent<PaneProps> = props => {
  let paneRef: HTMLElement;

  const cleanupMove: () => void = () => noop;
  let cleanupResize: () => void = () => noop;

  onMount(() => {
    console.log('Pane onMount', paneRef);
    paneRef.style.cssText = `
    grid-column-start: ${props.colStart};
    grid-row-start: ${props.rowStart};
    grid-column-end: ${props.colEnd};
    grid-row-end: ${props.rowEnd};
    position: relative;`;
  });

  onCleanup(() => {
    cleanupMove();
    cleanupResize();
  });

  // TODO rethink how to handle moving panes. I could simply it by allowing panes to be attached to each side
  // But I may also want to add "tabs" to the top of the panes for things which don't have to be displayed all the time
  // To support tabs I need to make the panes work in a smarter way that allows drag and drop without much complexity
  // Also when we have a side based anchor layout, I need to either generate css-grid areas dynamically or not use css-grid at all
  // const onMove = (e: MouseEvent) => {
  //   const posStart = {x: e.clientX, y: e.clientY};

  //   const onMouseMove = (e: MouseEvent) => {
  //     // const dragRefBounds = dragRef.getBoundingClientRect();
  //     // paneRef.style.left = (e.pageX - dragRefBounds.width / 2) + 'px';
  //     // paneRef.style.top = (e.pageY - dragRefBounds.height / 2) + 'px';
  //     const gridCompStyle = getComputedStyle(paneRef.parentElement as HTMLElement);
  //     const cellSizeX = parseInt(gridCompStyle.getPropertyValue('grid-template-columns').split('px ')[0]);
  //     const cellSizeY = parseInt(gridCompStyle.getPropertyValue('grid-template-rows').split('px ')[0]);
  //     const changeX = Math.round((e.clientX - posStart.x) / cellSizeX);
  //     const changeY = Math.round((e.clientY - posStart.y) / cellSizeY);

  //     console.log('move change', changeX, changeY, 'cellsize', cellSizeX, cellSizeY);

  //     const paneCompStyle = getComputedStyle(paneRef as HTMLElement);
  //     const colStart = parseInt(paneCompStyle.getPropertyValue('grid-column-start'));
  //     const colEnd = parseInt(paneCompStyle.getPropertyValue('grid-column-end'));
  //     const rowStart = parseInt(paneCompStyle.getPropertyValue('grid-row-start'));
  //     const rowEnd = parseInt(paneCompStyle.getPropertyValue('grid-row-end'));

  //     paneRef.style.cssText = `
  //     grid-column-start: ${colStart + changeX};
  //     grid-row-start: ${rowStart + changeY};
  //     grid-column-end: ${colEnd + changeX};
  //     grid-row-end: ${rowEnd + changeY};
  //     position: relative;`;
  //   };

  //   const onMouseUp = () => {
  //     document.removeEventListener('mousemove', onMouseMove);
  //     document.removeEventListener('mouseup', onMouseUp);
  //     document.exitPointerLock();
  //   };

  //   document.addEventListener('mousemove', onMouseMove);
  //   document.addEventListener('mouseup', onMouseUp);

  //   cleanupMove = () => {
  //     document.removeEventListener('mousemove', onMouseMove);
  //     document.removeEventListener('mouseup', onMouseUp);
  //   };
  // };

  const resizeStart = (e: PointerEvent) => {
    console.log('resizeStart', e);
    if (!(e.target as HTMLElement).classList.contains('resizer')) return;

    let resizer: HTMLElement | null = e.target as HTMLElement;
    const posStart = {x: e.clientX, y: e.clientY};
    const computedStyle = getComputedStyle(resizer.parentElement as HTMLElement);
    const gridColumnStart = parseInt(computedStyle.getPropertyValue('grid-column-start'));
    const gridColumnEnd = parseInt(computedStyle.getPropertyValue('grid-column-end'));
    const gridRowStart = parseInt(computedStyle.getPropertyValue('grid-row-start'));
    const gridRowEnd = parseInt(computedStyle.getPropertyValue('grid-row-end'));
    // (e.target as HTMLElement)?.parentElement?.classList.add(this.CLASS_RESIZING); // TODO 

    const resize = (e: PointerEvent) => {
      // TODO there is sometimes an issue when mouseup event seems to be ignored and it continues to resize the element. Find out why
      if (!resizer?.parentElement) throw new Error('resizer.parentElement is null');

      const gridCompStyle = getComputedStyle(paneRef.parentElement as HTMLElement);
      const cellSizeX = parseInt(gridCompStyle.getPropertyValue('grid-template-columns').split('px ')[0]);
      const cellSizeY = parseInt(gridCompStyle.getPropertyValue('grid-template-rows').split('px ')[0]);
      const changeX = Math.round((e.clientX - posStart.x) / cellSizeX);
      const changeY = Math.round((e.clientY - posStart.y) / cellSizeY);

      console.log('resize change', changeX, changeY, 'cellsize', cellSizeX, cellSizeY);

      const cl = resizer.classList;
      const pes = paneRef.style;
      if (cl.contains('cursor-e-resize') || cl.contains('cursor-ne-resize') || cl.contains('cursor-se-resize')) pes.gridColumnEnd = String(gridColumnEnd + changeX);
      if (cl.contains('cursor-w-resize') || cl.contains('cursor-nw-resize') || cl.contains('cursor-sw-resize')) pes.gridColumnStart = String(gridColumnStart + changeX);
      if (cl.contains('cursor-n-resize') || cl.contains('cursor-nw-resize') || cl.contains('cursor-ne-resize')) pes.gridRowStart = String(gridRowStart + changeY);
      if (cl.contains('cursor-s-resize') || cl.contains('cursor-sw-resize') || cl.contains('cursor-se-resize')) pes.gridRowEnd = String(gridRowEnd + changeY);
    };

    const resizeStop = () => {
      if (!resizer) return;
      console.log('resizeStop');
      resizer = null;
      // resizer.parentElement?.classList.remove(this.CLASS_RESIZING);
      document.removeEventListener('pointermove', resize);
      document.removeEventListener('pointerup', resizeStop);
      cleanupResize = noop;
    };

    document.addEventListener('pointermove', resize);
    document.addEventListener('pointerup', resizeStop);

    cleanupResize = () => {
      document.removeEventListener('pointermove', resize);
      document.removeEventListener('pointerup', resizeStop);
    };
  };

  return (
    <div onPointerDown={resizeStart} class={'p-1 border border-stone-600 rounded-md m-0 pt-8 pb-2 absolute text-[8px] text-white bg-stone-800 ' + (props.class || '')} ref={el => paneRef = el} >

      <Show when={props.title}>
        <div class="text-white text-[12px] bg-stone-900 rounded-t-md px-1 absolute left-0 right-0 top-0 border-b border-stone-600">{props.title}</div>
      </Show>

      {props.children}

      <div class="resizer cursor-n-resize absolute h-1 top-[-2px] left-0 right-0 z-10" /> {/* top */}
      <div class="resizer cursor-s-resize absolute h-1 bottom-[-2px] left-0 right-0 z-10" /> {/* bottom */}
      <div class="resizer cursor-w-resize absolute w-1 left-[-2px] top-0 bottom-0 z-10" /> {/* left */}
      <div class="resizer cursor-e-resize absolute w-1 right-[-2px] top-0 bottom-0 z-10" /> {/* right */}

      <div class="resizer cursor-nw-resize absolute w-2 h-2 top-[-2px] left-[-2px] z-10" /> {/* top-left */}
      <div class="resizer cursor-ne-resize absolute w-2 h-2 top-[-2px] right-[-2px] z-10" /> {/* top-right */}
      <div class="resizer cursor-sw-resize absolute w-2 h-2 bottom-[-2px] left-[-2px] z-10" /> {/* bottom-left */}
      <div class="resizer cursor-se-resize absolute w-2 h-2 bottom-[-2px] right-[-2px] z-10" /> {/* bottom-right */}

    </div>
  );
};
