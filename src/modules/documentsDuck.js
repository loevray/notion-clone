import { request } from "../utils/api.js";
import getDeepCopy from "../utils/getDeepCopy.js";
import { push } from "../utils/handleRouteEvent.js";
const FETCH_DOCUMENTS = "documents/FETCH_DOCUMENTS";
const FETCH_CURRENT_DOCUMENT = "documents/FETCH_CURRENT_DOCUMENT";
const UPDATE_DOCUMENT = "documents/UPDATE_DOCUMENT";

const fetchDocuments = async (dispatch) => {
  const documents = await request("/documents");
  // [{id:number, title:string, documents:array, createAt:string, updatedAt:string}]
  dispatch({
    type: FETCH_DOCUMENTS,
    payload: documents,
  });
};
export const fetchDocumentsAsync = () => async (dispatch, getState) => {
  try {
    fetchDocuments(dispatch);
  } catch (e) {
    console.log(e);
  }
};

const getSelectedDocumentPath = (documents, currentId) => {
  let temp = [];
  const getPath = (document, parent) => {
    if (currentId === document.id) {
      temp.push(...parent);
      return;
    }
    if (document?.documents?.length) {
      document.documents.forEach((doc) => getPath(doc, [...parent, document]));
    }
  };
  documents.forEach((doc) => getPath(doc, []));
  return temp;
};

export const fetchCurrentDocumentAsync =
  (documentId) => async (dispatch, getState) => {
    try {
      const selectedDocument = await request(`/documents/${documentId}`);
      dispatch({
        type: FETCH_CURRENT_DOCUMENT,
        payload: {
          ...selectedDocument,
          path: getSelectedDocumentPath(
            getState().documentsReducer.documents,
            selectedDocument.id
          ),
        },
      });
    } catch (e) {
      console.log(e);
      alert("존재하지 않는 문서군요?");
      push("/");
    }
  };
/* {
    "id": 122298,
    "title": "제목 없음",
    "content": null,
    "parent": {
    },
    "username": "5AKimyoungheon",
    "created_at": "2023-11-19T14:36:32.926Z",
    "updated_at": "2023-11-19T14:36:32.930Z"
  } */
export const updateDocumentAsync = (documentData) => async (dispatch) => {
  try {
    const { id, title, content } = documentData;
    const requestBody = {
      title,
      content,
    };
    const updateDocument = await request(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(requestBody),
    });
    dispatch({
      type: UPDATE_DOCUMENT,
      payload: {
        title: updateDocument.title,
        content: updateDocument.content,
      },
    });
    fetchDocuments(dispatch);
  } catch (e) {
    console.log(e);
  }
};

const initialState = {
  documents: [],
  selectedDocument: {},
};

export default function documentsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_DOCUMENTS: {
      return { ...state, documents: action.payload };
    }
    case FETCH_CURRENT_DOCUMENT: {
      return {
        ...state,
        selectedDocument: action.payload,
      };
    }
    case UPDATE_DOCUMENT: {
      return {
        ...state,
        selectedDocument: {
          ...getDeepCopy(state.selectedDocument),
          title: action.payload.title,
          content: action.payload.content,
        },
      };
    }
    default:
      return state;
  }
}
