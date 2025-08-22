import { useState, useRef } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
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
 * A simplified file upload component that renders as a button and opens 
 * the file browser when clicked, without drag-and-drop interface.
 * 
 * Features:
 * - Clean, minimal button interface
 * - Direct file browser opening on click
 * - Upload progress indication
 * - Image file validation
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL)
 * @param props.onComplete - Callback function called when upload is complete
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes
      },
      autoProceed: true, // Auto upload when file is selected
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("file-added", () => {
        setIsUploading(true);
      })
      .on("complete", (result) => {
        setIsUploading(false);
        onComplete?.(result);
      })
      .on("error", () => {
        setIsUploading(false);
      })
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Clear previous files
      uppy.getFiles().forEach(file => uppy.removeFile(file.id));
      
      // Add new file
      try {
        uppy.addFile({
          name: files[0].name,
          type: files[0].type,
          data: files[0],
        });
      } catch (error) {
        console.error('Error adding file:', error);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedFileTypes.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        multiple={maxNumberOfFiles > 1}
      />
      <Button 
        onClick={handleButtonClick} 
        className={buttonClassName} 
        type="button"
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : children}
      </Button>
    </div>
  );
}