import Editor from "../component/Editor.js";
import Title from "../common/Title.js";
import { getPathData } from "../utils/getPathData.js";
import { store } from "../main.js";
import {
  fetchCurrentDocumentAsync,
  updateDocumentAsync,
} from "../modules/documentsDuck.js";
import Component from "../core/Component.js";
import { observe, unobserve } from "../utils/observer/Observe.js";
import { push } from "../utils/handleRouteEvent.js";

// initialState : {doucmentId :null, document:null}
export default class DocumentPage extends Component {
  constructor({ $target, props }) {
    super({ $target, props, tagName: "div" });
  }
  prepare() {
    this.wrapper.classList.add("document-page");
    const [path, documentId = pathData] = getPathData();
    this.documentId = documentId;
    this.getCurrentDocument();
    observe(this);
  }
  getCurrentDocument() {
    store.dispatch(fetchCurrentDocumentAsync(this.documentId));
  }
  render() {
    const data = store.useSelector(
      (state) => state.documentsReducer.selectedDocument
    );

    this.wrapper.innerHTML = "";

    const { id, title, content, path } = data;
    console.log(path);
    if (id) {
      if (path.length) {
        path.forEach(
          ({ id: parentId, title }) =>
            new Title({
              $target: this.wrapper,
              props: {
                initialState: {
                  href: `documents/${parentId}`,
                  title,
                },
                onClick: () => push(`/documents/${parentId}`),
              },
            })
        );
      }

      let timerOfSetTimeout = null;
      new Editor({
        $target: this.wrapper,
        props: {
          initialState: {
            id,
            title,
            content,
          },
          documentAutoSave: (documentData) => {
            if (timerOfSetTimeout !== null) {
              clearTimeout(timerOfSetTimeout);
            }
            timerOfSetTimeout = setTimeout(() => {
              store.dispatch(updateDocumentAsync(documentData));
            }, 1500);
          },
        },
      });
      this.renderChild();
    }
  }
  unmount() {
    unobserve(this);
    this.$target.removeChild(this.wrapper);
  }
}
