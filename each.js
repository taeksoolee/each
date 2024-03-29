const ID = '__id__';
function withId(base) {
  return {
    ...base,
    [ID]: `id-${Date.now()}__${Math.round(Math.random() * 1000)}`
  }
}
function listWithId(list) {
  return list.map(e => {
    if (e[ID]) return e;
    else return withId(e);
  })
}

function create(name, create) {
  const _list = new Proxy({
    list: [],
    add(data) {
      this.list = [
        ...todos.list,
        data,
      ];
    },
    del(idx) {
      const clone = [...this.list];
      clone.splice(idx, 1);
      this.list = clone;
    }
  }, {
    set(target, attr, newVal) {
      if (attr !== 'list') {
        console.warn('set is only list')
        return true;
      }

      target[attr] = listWithId(newVal);
      const wrappers = [...document.querySelectorAll(`[each=${name}]`)];
      render(target.list, create, wrappers);

      return true;
    },
    get(target, attr) {
      return target[attr];
    }
  });

  return _list;
}

const Flag = Object.freeze({
  NEW: 'new',
  OLD: 'old',
})

function render(list, create, wrapper) {
  (Array.isArray(wrapper) ? wrapper : [wrapper])
    .forEach(wrapper => {
      const children = [...wrapper.children]
      const oldElemMap = children.reduce((a, elem) => {
        a[elem.dataset.id] = {
          elem, flag: true,
        };
        return a;
      }, {});

      const elems = list
        .reduce((a, item, idx) => {
          const id = item[ID];
          const before = idx > 0 ? a[idx-1].elem : null;

          if (oldElemMap[id]) {
            oldElemMap[id].flag = false;
            a.push({ elem: oldElemMap[id].elem, flag: Flag.OLD, before });
          } else {
            const elem = create(item);
            elem.setAttribute('data-id', id);
            a.push({ elem, flag: Flag.NEW, before });
          }

          return a;
        }, []);

      const removedElems = Object.values(oldElemMap).filter(e => e.flag);
      removedElems.forEach(({elem}) => wrapper.removeChild(elem));
      
      elems.forEach(({ elem, flag, before }, idx) => {
        if (flag === Flag.NEW) {
          if (idx === 0) {
            wrapper.insertAdjacentElement('beforeend', elem);
          } else {
            before.insertAdjacentElement('afterend', elem);
          }
        }
      });
    });
}