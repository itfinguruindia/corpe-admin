declare namespace google {
  namespace picker {
    enum Action {
      PICKED = "picked",
      CANCEL = "cancel",
    }

    enum ViewId {
      DOCS = "all",
    }

    class DocsView {
      constructor(viewId: ViewId);
      setIncludeFolders(include: boolean): DocsView;
      setMimeTypes(mimeTypes: string): DocsView;
      setSelectFolderEnabled(enabled: boolean): DocsView;
    }

    class PickerBuilder {
      setAppId(appId: string): PickerBuilder;
      setDeveloperKey(key: string): PickerBuilder;
      setOAuthToken(token: string): PickerBuilder;
      addView(view: DocsView): PickerBuilder;
      setTitle(title: string): PickerBuilder;
      setCallback(
        callback: (data: {
          action: string;
          docs?: Array<{ id: string; name: string; mimeType: string }>;
        }) => void,
      ): PickerBuilder;
      build(): { setVisible: (visible: boolean) => void };
    }
  }
}

interface Window {
  google?: typeof google;
  gapi?: {
    load: (
      api: string,
      options: { callback: () => void; onerror?: () => void },
    ) => void;
  };
}
