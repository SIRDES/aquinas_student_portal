// utils/swal.ts
// import Swal from 'sweetalert2';
// import withReactContent from 'sweetalert2-react-content';

// Optional: for JSX support if you want to render React components in alerts
// const MySwal = withReactContent(Swal);

export const showAlert = async ({
    title,
    severity,
    text,
    handleConfirmButtonClick,
    allowOutsideClick = true,
    showCancelButton = false,
    cancelButtonText = 'Cancel',
    showCloseButton = false,
    confirmButtonText = 'Close',
}: {
    title: string;
    severity: 'success' | 'error' | 'warning';
    text?: string;
    handleConfirmButtonClick?: () => void;
    allowOutsideClick?: boolean;
    showCancelButton?: boolean;
    cancelButtonText?: string;
    showCloseButton?: boolean;
    confirmButtonText?: string;
}) => {
    if (typeof window !== 'undefined') {
        const Swal = (await import('sweetalert2')).default;

        const color =
            severity === 'success'
                ? '#3085d6'
                : severity === 'error'
                    ? '#d33'
                    : '#f0ad4e';

        Swal.fire({
            icon: severity,
            title,
            text,
            confirmButtonColor: color,
            confirmButtonText: confirmButtonText || 'CLOSE',
            allowOutsideClick,
            showCancelButton,
            cancelButtonText,
            showCloseButton,
        }).then((result) => {
            if (result.isConfirmed && handleConfirmButtonClick) {
                handleConfirmButtonClick();
            }
        });
    }
};