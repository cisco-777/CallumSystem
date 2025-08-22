import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
// Note: CSS imports removed due to package compatibility issues
// Basic styling will be handled by component classes

// Add basic Uppy styles inline for functionality
const uppyStyles = `
  .uppy-Root { font-family: inherit; }
  .uppy-Dashboard-inner { 
    border-radius: 8px; 
    background: white; 
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
  .uppy-Dashboard-AddFiles { 
    border: 2px dashed #d1d5db; 
    border-radius: 8px; 
    background: #f9fafb; 
  }
  .uppy-Dashboard-AddFiles:hover { 
    border-color: #3b82f6; 
    background: #eff6ff; 
  }
  .uppy-Dashboard-browse { 
    color: #3b82f6; 
    font-weight: 600; 
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('uppy-custom-styles')) {
  const style = document.createElement('style');
  style.id = 'uppy-custom-styles';
  style.textContent = uppyStyles;
  document.head.appendChild(style);
}
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
  allowedFileTypes?: string[];
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 * @param props.allowedFileTypes - Array of allowed MIME types (default: image types)
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  allowedFileTypes = ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.webp']
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
        setShowModal(false);
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName} type="button">
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        plugins={['Webcam']}
        note="Images up to 10MB, JPG/PNG/JPEG formats only"
      />
    </div>
  );
}