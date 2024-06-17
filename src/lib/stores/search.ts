import { writable } from "svelte/store";

export interface SearchStoreModel<T extends Record<PropertyKey, any>> {
  data: T[];
  filtered: T[];
  search: string;
  filtro: string;
}

export const createSearchStore = <T extends Record<PropertyKey, any>>(
  data: T[]
) => {
  const { subscribe, set, update } = writable<SearchStoreModel<T>>({
    data,
    filtered: data,
    search: "",
    filtro: "",
  });

  return {
    subscribe,
    set,
    update,
  };
};

export const searchHandler = <T extends Record<PropertyKey, any>>(
  store: SearchStoreModel<T>
) => {
  const searchTerm = store.search.toLowerCase() || "";
  // if (store.filtro === "") {
  //   store.filtered = store.data.filter((usuario) =>
  //     usuario.searchTerm.toLowerCase().includes(searchTerm)
  //   );
  // } else {
  //   if (store.filtro != "" && store.search === "") {
  //     store.filtered = store.data.filter((usuario) =>
  //       usuario.searchTerm.toLowerCase().includes(store.filtro)
  //     );
  //   } else {
  store.filtered = store.data.filter(
    (usuario) =>
      usuario.searchTerm.toLowerCase().includes(store.filtro) &&
      usuario.searchTerm.toLowerCase().includes(searchTerm)
  );
  // }
  // }
};
