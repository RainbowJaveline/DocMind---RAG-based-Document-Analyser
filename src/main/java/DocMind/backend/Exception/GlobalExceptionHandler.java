package DocMind.backend.Exception;

import DocMind.backend.DTO.ApiResponse;
import org.hibernate.annotations.CurrentTimestamp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler{
    private static Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> resourceNotFoundException(ResourceNotFoundException exception){
        logger.warn("Resource Not Found: {"+ exception.getMessage()+"}");
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.builder()
                        .success(false)
                        .message(exception.getMessage())
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @ExceptionHandler(DocumentProcessingException.class)
    public ResponseEntity<?> documentProcessingException(DocumentProcessingException exception){
        logger.error("Document Not Found : {{}}", exception.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT)
                .body(ApiResponse.builder()
                        .success(false)
                        .message(exception.getMessage())
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> maxUplaodSizeException(MaxUploadSizeExceededException exception){
        logger.warn("File Size is Too large: {}", exception.getMessage());
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE)
                .body(ApiResponse.builder()
                        .success(false)
                        .message("File is Too large")
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build());
    }

}
