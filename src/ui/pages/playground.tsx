import { Banner, Button } from "../shared";
import { defaultToast, queueToasts, selectActiveToasts } from "@app/toast";
import { useDispatch, useSelector } from "react-redux";

const ToastViewer = () => {
  const toasts = useSelector(selectActiveToasts);

  return (
    <div className="fixed bottom-4 right-4 w-[300px] z-50">
      {toasts.map((toast) => {
        return (
          <Banner key={toast.id} variant={toast.type} className="my-2">
            {toast.id} {toast.text}
          </Banner>
        );
      })}
    </div>
  );
};

export const PlaygroundPage = () => {
  const dispatch = useDispatch();
  const onToast = () => {
    dispatch(
      queueToasts([defaultToast({ text: "Hi THERE!", type: "success" })]),
    );
  };

  return (
    <div>
      <Button onClick={onToast}>Toast me!</Button>
      <ToastViewer />
    </div>
  );
};
