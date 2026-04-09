import java.io.*;
import java.nio.file.*;

public class test-pdf {
    public static void main(String[] args) {
        try {
            // Test basic PDF generation
            String testContent = "Test PDF Content";
            Files.write(Paths.get("test.txt"), testContent.getBytes());
            System.out.println("Basic file write test: SUCCESS");
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
