module.exports = (data) => {
    return `
            </div>
        
            <!-- Footer -->
            <div class="footer">
                <div class="copyright">Copyright ${data.global.yearCreated} ${data.global.companyName} | All Rights Reserved</div>
            </div>
        </div>
    </body>
</html>
    `;
}