import {Component, For} from 'solid-js';
import {Pane, ResizeProps} from './Pane';

export const Browser: Component<ResizeProps> = props => {
  // TODO dedupe with Explorer
  const iconMap: Record<string, string> = {
    object: 'view_in_ar',
    terrain: 'terrain',
    image: 'wallpaper'
  };

  const items = [
    {name: 'Terrain', type: 'terrain'},
    {name: 'House', type: 'image'},
    {name: 'Tree', type: 'image'},
    {name: 'Rock', type: 'object', file: 'assets/levels/prefabs/rock.rube'},
    {name: 'Crate', type: 'object', file: 'assets/levels/prefabs/crate.rube'},
    {name: 'Cane', type: 'object', file: 'assets/levels/prefabs/cane.rube'},
    {name: 'Coin', type: 'object', file: 'assets/levels/prefabs/coin.rube'},
  ];

  return <>
    <Pane title="Item Browser" class="@container" {...props}>
      {/* TODO reduce to the minimal amount of container queries */}
      <div class="scrollbar grid max-h-full grid-cols-3 gap-3 p-2 @lg:grid-cols-5 @3xl:grid-cols-6 @4xl:grid-cols-8 @5xl:grid-cols-10 @6xl:grid-cols-12" >
        <For each={items} fallback={<div>Empty</div>}>
          {(item) => (
            <div class="relative cursor-pointer overflow-hidden rounded-md bg-stone-700 p-1 hover:bg-stone-600">
              {/* <img src={item.thumbnail} alt="" class="group aspect-square block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100" /> */}
              <i class="material-icons group flex aspect-square w-full items-center justify-center rounded-md bg-gray-100 text-7xl text-stone-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100" >{iconMap[item.type]}</i>
              <p class="">{item.name}</p>
            </div>
          )}
        </For>
      </div>
    </Pane>
  </>;
};
