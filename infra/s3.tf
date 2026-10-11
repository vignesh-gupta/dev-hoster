resource "random_id" "bucket" {
  byte_length = 4
}

resource "aws_s3_bucket" "outputs" {
  bucket        = "${var.name}-outputs-${random_id.bucket.hex}"
  force_destroy = true
}

# The preview proxy fetches built sites over plain HTTP(S) from
# <bucket>/__outputs/<projectId>/..., so that prefix must be publicly readable.
resource "aws_s3_bucket_public_access_block" "outputs" {
  bucket                  = aws_s3_bucket.outputs.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_outputs" {
  bucket = aws_s3_bucket.outputs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadBuiltSites"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.outputs.arn}/__outputs/*"
    }]
  })

  depends_on = [aws_s3_bucket_public_access_block.outputs]
}
