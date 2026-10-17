package DocMind.backend.Service;

import DocMind.backend.Exception.DocumentProcessingException;
import jakarta.annotation.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ParserService {

    private final static Logger log = LoggerFactory.getLogger(ParserService.class);
    public List<Document> parse(MultipartFile file) {
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String contentType = file.getContentType()!=null ? file.getContentType() : "application/octat-stream";
        log.info("Parsing Document: {} , size : {} bytes , contentTypee : {} " , fileName,file.getSize(),contentType);

        try{

            Resource resource = new ByteArrayResource(file.getBytes()){
                public @Nullable String getFileName(){
                    return fileName;
                }
            };

            if(fileName.toLowerCase().endsWith(".pdf") || contentType.equals("pdf")){
                return parsePdf(resource);
            }else{
                return parseGeneric(resource);
            }

        } catch (IOException e) {
            log.error("Failed to Read the File Bytes:{}",fileName,e);
            throw new DocumentProcessingException("Could not read uploaded file : "+fileName, e);
        } catch (Exception e) {
            log.error("Error during Parsing the Document : {}",fileName,e);
            throw new DocumentProcessingException("Failed to Parse the File : "+fileName, e);
        }

    }

    private List<Document> parseGeneric(Resource resource) {
        PdfDocumentReaderConfig documentReaderConfig = PdfDocumentReaderConfig.builder()
                .withPageTopMargin(0)
                .withPageBottomMargin(0)
                .build();
        PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource,documentReaderConfig);
        return pdfReader.read();
    }

    private List<Document> parsePdf(Resource resource) {
       TikaDocumentReader documentReader = new TikaDocumentReader(resource);
        return documentReader.read();
    }
}
