import toast from 'react-hot-toast';

const Toast = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast(msg),
  promise: (promise, msgs) => toast.promise(promise, msgs),
};

export default Toast;

