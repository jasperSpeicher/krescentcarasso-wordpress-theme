export const chunkReducer = chunkSize =>
  (groups, image) => {
    if (groups[groups.length - 1].length === chunkSize) {
      groups.push([]);
    }
    groups[groups.length - 1].push(image);
    return groups;
  };
