import Button from "../common/Button.js";
import DocumentList from "./DocumentList.js";
import DocumentListHeader from "./DocumentListHeader.js";
import plusIcon from "../svg/plusIcon.js";
import { request } from "../utils/api.js";
import { push } from "../utils/handleRouteEvent.js";
import Storage from "../utils/storage.js";
import { store } from "../main.js";
import { fetchDocumentsAsync } from "../modules/documentsDuck.js";
import Component from "../core/Component.js";
import { observe } from "../utils/observer/Observe.js";

export default class Nav extends Component {
  constructor({ $target }) {
    super({ $target, tagName: "nav" });
  }
  //항상 존재해야하는 컴포넌트라서, 내부에서 타겟에 붙여주었다.
  //문서 리스트를 가져온다.
  prepare() {
    this.getDocuments();
    this.rerender = () => this.render();
    observe(this.rerender);
  }
  getDocuments() {
    store.dispatch(fetchDocumentsAsync());
  }
  async createDocument(id = null) {
    const body = { title: "제목 없음", parent: id };
    const response = await request("/documents", {
      method: "POST",
      body: JSON.stringify(body),
    });
    this.getDocuments();
    push(`/documents/${response.id}`);
    return response;
  }
  async removeDocument(id) {
    await request(`/documents/${id}`, {
      method: "DELETE",
    });
    this.getDocuments();
    push("/");
  }
  render() {
    console.log("nav 렌더됨");
    const data = store.useSelector((state) => state.documentsReducer.documents);
    this.wrapper.innerHTML = "";
    new DocumentListHeader({ $target: this.wrapper });
    new DocumentList({
      $target: this.wrapper,
      props: {
        initialState: data,
        createDocument: this.createDocument.bind(this),
        removeDocument: this.removeDocument.bind(this),
        depth: 0,
      },
    });
    new Button({
      $target: this.wrapper,
      content: `${plusIcon} <span>페이지 추가</span>`,
      attributes: [{ name: "class", value: "add-root-doc-btn" }],
      onClick: async () => {
        const response = await this.createDocument();
        const storage = new Storage(window.localStorage);
        storage.setItem(response.id, { isFolded: true });
      },
    });
  }
  addEvent() {
    const maxNavWidth = 500;
    const minNavWidth = 250;
    const gap = 15;
    document.addEventListener("mousedown", (e) => {
      //마우스 다운시점의 시작 x좌표와, nav바의 너비를 저장해둠.
      const startX = e.clientX;
      const initialWidth = this.wrapper.offsetWidth;
      if (Math.abs(startX - initialWidth) > gap) return;
      const onMouseMove = (e) => {
        const newX = e.clientX;
        const delta = newX - startX;
        const calculatedWidth = Math.max(minNavWidth, initialWidth + delta); // 최소 너비를 250px로 설정
        //최대너비는 500px
        if (calculatedWidth >= maxNavWidth) {
          this.wrapper.style.width = `${calculatedWidth}px`;
          //크기를 더 키우려하면(클릭 시점보다 움직인 좌표가 양수면)
          if (startX < newX) {
            onMouseUp();
          }
        } else {
          this.wrapper.style.width = `${calculatedWidth}px`;
        }
      };
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
    document.addEventListener("mousemove", (e) => {
      const startX = e.clientX;
      const initialWidth = this.wrapper.offsetWidth;
      if (Math.abs(startX - initialWidth) > gap) {
        document.body.classList.remove("resize-cursor");
        this.wrapper.classList.remove("resize-cursor");
        this.wrapper.classList.remove("thick-border");
      } else {
        document.body.classList.add("resize-cursor");
        this.wrapper.classList.add("thick-border");
      }
    });
  }
}
