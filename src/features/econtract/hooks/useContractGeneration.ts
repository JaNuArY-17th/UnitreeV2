import { useState, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useEcontract } from '../hooks/useEcontract';
import { JobStatus, ContractStatusParams } from '../types';

export const useContractGeneration = () => {
  const { t } = useTranslation();
  const { generateContract, checkQueueStatus } = useEcontract();

  // States
  const [currentStatus, setCurrentStatus] = useState<JobStatus>(null);
  const [isJobCompleted, setIsJobCompleted] = useState(false);
  const [statusCheckTimeout, setStatusCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  // Thêm state để lưu PDF URL
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Thêm ref để theo dõi trạng thái thực tế
  const statusRef = useRef<JobStatus>(null);

  // Cập nhật statusRef khi currentStatus thay đổi
  useEffect(() => {
    if (currentStatus !== statusRef.current) {
      console.log(`Updating statusRef from ${statusRef.current} to ${currentStatus}`);
      statusRef.current = currentStatus;
    }
  }, [currentStatus]);

  // Khởi tạo hợp đồng
  const initializeContract = async () => {
    try {
      console.log('Initializing contract');
      // Gọi API tạo hợp đồng
      const job = await generateContract();
      if (job) {
        // Bắt đầu kiểm tra trạng thái mỗi 5s
        startStatusCheck(job.queue_name, job.job_id);
        return null; // Chỉ trả về URL sau khi kiểm tra trạng thái hoàn thành
      }
    } catch (err: any) {
      console.error('Error initializing contract:', err);
      Alert.alert(
        t('common.error', 'Lỗi'),
        t('econtract.generateError', 'Không thể tạo hợp đồng. Vui lòng thử lại sau.')
      );
    }
    return null;
  };

  // Bắt đầu kiểm tra trạng thái
  const startStatusCheck = (queueName: string, jobId: string) => {
    console.log('Starting status check for job:', jobId);
    statusRef.current = 'pending';
    setCurrentStatus('pending');
    setIsJobCompleted(false);

    // Kiểm tra ngay lập tức một lần
    checkStatus(queueName, jobId);
  };

  // Lên lịch cho lần kiểm tra tiếp theo
  const scheduleNextStatusCheck = (queueName: string, jobId: string) => {
    // Chỉ lên lịch nếu job chưa hoàn thành
    if (statusRef.current !== 'completed' && statusRef.current !== 'failed' && !isJobCompleted) {
      console.log('Scheduling next status check in 5 seconds');

      // Xóa timeout hiện tại nếu có
      if (statusCheckTimeout) {
        clearTimeout(statusCheckTimeout);
      }

      // Thiết lập timeout mới
      const timeout = setTimeout(() => {
        console.log(`Executing scheduled status check for job ${jobId}`);
        checkStatus(queueName, jobId);
      }, 5000);

      setStatusCheckTimeout(timeout);
    } else {
      console.log(`Not scheduling next check because status is ${statusRef.current} or isJobCompleted=${isJobCompleted}`);
    }
  };

  // Kiểm tra trạng thái job
  const checkStatus = async (queueName: string, jobId: string) => {
    try {
      // Nếu status đã completed hoặc failed, không cần gọi API nữa
      if (statusRef.current === 'completed' || statusRef.current === 'failed' || isJobCompleted) {
        if (statusCheckTimeout) {
          clearTimeout(statusCheckTimeout);
          setStatusCheckTimeout(null);
        }
        console.log('Skipping status check due to completed/failed status');
        return null;
      }

      console.log('Executing status check for', queueName, jobId);
      const response = await checkQueueStatus({ queue_name: queueName, job_id: jobId } as ContractStatusParams);
      console.log('Job status response:', JSON.stringify(response, null, 2));

      if (response && response.data) {
        console.log('Response data:', JSON.stringify(response.data, null, 2));

        // Kiểm tra cả hai vị trí có thể chứa status
        let status: string | undefined;
        let resultObject: any = null;

        // Trường hợp 1: Status ở trong data.result.status
        if (response.data.result && typeof response.data.result === 'object') {
          resultObject = response.data.result;
          if (resultObject.status) {
            status = resultObject.status;
          }
        }

        // Trường hợp 2: Status ở trực tiếp trong data.status
        if (!status && response.data.status) {
          status = response.data.status;
        }

        console.log('Detected status:', status);

        if (status === 'completed') {
          console.log('Status is completed, processing result');
          statusRef.current = 'completed';
          setCurrentStatus('completed');
          setIsJobCompleted(true);
          // Khi hoàn thành, dừng việc kiểm tra
          if (statusCheckTimeout) {
            console.log('Clearing timeout on completed status');
            clearTimeout(statusCheckTimeout);
            setStatusCheckTimeout(null);
          }

          // Tìm URL PDF từ nhiều vị trí có thể có
          let foundPdfUrl: string | undefined;

          // Vị trí 1: Theo cấu trúc đã định nghĩa
          if (resultObject && resultObject.uploadFileEcontractS3) {
            console.log('Found uploadFileEcontractS3:', resultObject.uploadFileEcontractS3);

            const uploadFileData = resultObject.uploadFileEcontractS3;
            if (uploadFileData.unsigned_file && uploadFileData.unsigned_file.file_url) {
              foundPdfUrl = uploadFileData.unsigned_file.file_url;
              console.log('Found PDF URL in standard location:', foundPdfUrl);
            }
          }

          // Vị trí 2: Có thể nằm ở vị trí khác trong response
          if (!foundPdfUrl) {
            // Tìm bất kỳ trường nào có chứa file_url
            const findFileUrl = (obj: any): string | undefined => {
              if (!obj || typeof obj !== 'object') return undefined;

              for (const key in obj) {
                if (key === 'file_url' && typeof obj[key] === 'string') {
                  return obj[key];
                }

                if (typeof obj[key] === 'object') {
                  const found = findFileUrl(obj[key]);
                  if (found) return found;
                }
              }

              return undefined;
            };

            foundPdfUrl = findFileUrl(response.data);
            if (foundPdfUrl) {
              console.log('Found PDF URL in alternate location:', foundPdfUrl);
            }
          }

          if (foundPdfUrl) {
            // Đảm bảo URL được mã hóa đúng cách
            const encodedUrl = foundPdfUrl.replace(/\s/g, '%20');
            console.log('Encoded URL:', encodedUrl);

            // Cố gắng thêm một timestamp để tránh cache
            const timeStamp = new Date().getTime();
            const urlWithTimestamp = `${encodedUrl}?t=${timeStamp}`;
            console.log('URL with timestamp:', urlWithTimestamp);

            // Cập nhật state pdfUrl
            setPdfUrl(urlWithTimestamp);
            return urlWithTimestamp;
          } else {
            console.error('PDF URL not found anywhere in response');
            Alert.alert(
              t('common.error', 'Lỗi'),
              t('econtract.noPdfUrl', 'Không tìm thấy file hợp đồng. Vui lòng thử lại.')
            );
          }
        } else if (status === 'failed') {
          console.log('Status is failed');
          statusRef.current = 'failed';
          setCurrentStatus('failed');
          setIsJobCompleted(true);
          if (statusCheckTimeout) {
            console.log('Clearing timeout on failed status');
            clearTimeout(statusCheckTimeout);
            setStatusCheckTimeout(null);
          }

          // Lấy message từ nhiều vị trí có thể có
          let errorMessage =
            (resultObject && resultObject.message) ||
            response.data.message ||
            t('econtract.processingError', 'Xử lý hợp đồng thất bại. Vui lòng thử lại.');

          Alert.alert(
            t('common.error', 'Lỗi'),
            errorMessage
          );
        } else {
          console.log('Status is still pending or unknown:', status);
          // Lên lịch cho lần kiểm tra tiếp theo nếu vẫn đang pending
          scheduleNextStatusCheck(queueName, jobId);
        }
      } else {
        console.error('Invalid response format');
        // Vẫn lên lịch kiểm tra tiếp theo ngay cả khi có lỗi format
        scheduleNextStatusCheck(queueName, jobId);
      }

      return null;
    } catch (err: any) {
      console.error('Error checking status:', err);
      // Lên lịch kiểm tra tiếp theo ngay cả khi có lỗi
      scheduleNextStatusCheck(queueName, jobId);
      return null;
    }
  };

  // Cleanup resources
  const cleanupResources = () => {
    if (statusCheckTimeout) {
      console.log('Clearing status check timeout');
      clearTimeout(statusCheckTimeout);
      setStatusCheckTimeout(null);
    }
  };

  return {
    initializeContract,
    currentStatus,
    isJobCompleted,
    pdfUrl,
    cleanupResources
  };
};
