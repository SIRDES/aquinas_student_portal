'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';

interface PaymentDetails {
    email: string;
    amount: number;
    beceIndexNumber: string;
    parentPhoneNumber: string;
    name: string;
}

export default function MakePayment({
    paymentDetails,
    handleSuccess,
    handleClose,
    disabled,
}: {
    paymentDetails: PaymentDetails;
    handleSuccess: (response: any) => Promise<void>;
    handleClose: () => void;
    disabled: boolean;
}) {
    const [initializePayment, setInitializePayment] = useState<any>(null);

    // ✅ Memoize config to avoid recreating on every render
    const paystackConfig = useMemo(
        () => ({
            publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
            email: paymentDetails.email,
            amount: paymentDetails.amount * 100,
            currency: 'GHS',
            label: 'Aquinas Admission',
            metadata: {
                custom_fields: [
                    {
                        display_name: 'Parent Phone number',
                        variable_name: 'parentPhoneNumber',
                        value: paymentDetails.parentPhoneNumber,
                    },
                    {
                        display_name: 'Bece index number',
                        variable_name: 'beceIndexNumber',
                        value: paymentDetails.beceIndexNumber,
                    },
                    {
                        display_name: 'Student name',
                        variable_name: 'studentName',
                        value: paymentDetails.name,
                    },
                ],
            },
        }),
        [paymentDetails]
    );

    useEffect(() => {
        let isMounted = true;

        async function loadPaystack() {
            if (typeof window !== 'undefined') {
                const paystackModule = await import('react-paystack');
                const init = paystackModule.usePaystackPayment(paystackConfig);
                if (isMounted) setInitializePayment(() => init);
            }
        }

        loadPaystack();

        return () => {
            isMounted = false;
        };
    }, [paystackConfig]);

    return (
        <>
            {initializePayment && (
                <Button
                    variant="contained"
                    disabled={disabled}
                    fullWidth
                    onClick={() =>
                        initializePayment({
                            onSuccess: handleSuccess,
                            onClose: handleClose,
                        })
                    }
                >
                    Make payment
                </Button>
            )}
        </>
    );
}
