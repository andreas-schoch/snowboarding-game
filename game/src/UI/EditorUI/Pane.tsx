import {ParentComponent, onCleanup, onMount, Show} from 'solid-js';

const noop = () => {};
export type ResizeProps = {colStart: number, colEnd: number, rowStart: number, rowEnd: number};
export type PaneProps = {title: string, class?: string} & ResizeProps;

export const Pane: ParentComponent<PaneProps> = props => {
  let paneRef: HTMLElement;

  const cleanupMove: () => void = () => noop;
  let cleanupResize: () => void = () => noop;

  onMount(() => {
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

  const resizeStart = (e: PointerEvent) => {
    console.debug('resizeStart', e);
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

      console.debug('resize change', changeX, changeY, 'cellsize', cellSizeX, cellSizeY);

      const cl = resizer.classList;
      const pes = paneRef.style;
      if (cl.contains('cursor-e-resize') || cl.contains('cursor-ne-resize') || cl.contains('cursor-se-resize')) pes.gridColumnEnd = String(gridColumnEnd + changeX);
      if (cl.contains('cursor-w-resize') || cl.contains('cursor-nw-resize') || cl.contains('cursor-sw-resize')) pes.gridColumnStart = String(gridColumnStart + changeX);
      if (cl.contains('cursor-n-resize') || cl.contains('cursor-nw-resize') || cl.contains('cursor-ne-resize')) pes.gridRowStart = String(gridRowStart + changeY);
      if (cl.contains('cursor-s-resize') || cl.contains('cursor-sw-resize') || cl.contains('cursor-se-resize')) pes.gridRowEnd = String(gridRowEnd + changeY);
    };

    const resizeStop = () => {
      if (!resizer) return;
      console.debug('resizeStop');
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
    <div onPointerDown={resizeStart} class={'p-1 border border-stone-600 rounded-md overflow-hidden m-0 pt-8 pb-2 absolute text-[8px] text-white bg-stone-800 ' + (props.class || '')} ref={el => paneRef = el} >

      <Show when={props.title}>
        <div class="absolute inset-x-0 top-0 rounded-t-md border-b border-stone-600 bg-stone-900 px-2.5 text-[12px] text-white">{props.title}</div>
      </Show>

      {props.children}

      <div class="resizer absolute inset-x-0 top-[-2px] z-10 h-1 cursor-n-resize" /> {/* top */}
      <div class="resizer absolute inset-x-0 bottom-[-2px] z-10 h-1 cursor-s-resize" /> {/* bottom */}
      <div class="resizer absolute inset-y-0 left-[-2px] z-10 w-1 cursor-w-resize" /> {/* left */}
      <div class="resizer absolute inset-y-0 right-[-2px] z-10 w-1 cursor-e-resize" /> {/* right */}

      <div class="resizer absolute left-[-2px] top-[-2px] z-10 size-2 cursor-nw-resize" /> {/* top-left */}
      <div class="resizer absolute right-[-2px] top-[-2px] z-10 size-2 cursor-ne-resize" /> {/* top-right */}
      <div class="resizer absolute bottom-[-2px] left-[-2px] z-10 size-2 cursor-sw-resize" /> {/* bottom-left */}
      <div class="resizer absolute bottom-[-2px] right-[-2px] z-10 size-2 cursor-se-resize" /> {/* bottom-right */}

    </div>
  );
};
